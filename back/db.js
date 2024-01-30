import dotenv from 'dotenv';

import bcrypt from 'bcrypt';

import passGen from 'generate-password';

import pg from 'pg';
import pgFormat from 'pg-format';

const configLoaded = dotenv.config();

// if it is not run under PM2 and dotenv config is not provided
if (!process.env.NODE_ENV && configLoaded.error) {
  console.error(configLoaded.error.toString());
  process.exit(1);
}
const saltRounds = 8;
const passOptions = {
  length: 18, numbers: true, uppercase: false, excludeSimilarCharacters: true, strict: true, symbols: false
};

const { Pool } = pg;
const pool = new Pool();
// prevent formatting as a timestamp with zone
pg.types.setTypeParser(1114, (x) => x);

const databaseQuery = `SELECT table_name, column_name, ordinal_position,
column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position`;

const tablesQueries = [
  `CREATE TABLE IF NOT EXISTS persons (
id SERIAL PRIMARY KEY,
firstName text not null,
lastName varchar,
patroName text,
sex integer,
wikidata integer
)`,
  `ALTER TABLE persons OWNER TO ${process.env.PGUSER}`,
  `CREATE TABLE IF NOT EXISTS works (
id SERIAL PRIMARY KEY,
title text not null,
genre integer,
genrename text,
authors integer[] NULL
)`,
  `ALTER TABLE works OWNER TO ${process.env.PGUSER}`,
  `CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
firstname text not null,
lastname text not null,
email text not null,
sex integer not null,
privs integer not null,
prefs json,
_passhash text not null,
activated BOOLEAN NOT NULL DEFAULT FALSE
)`,
  // `ALTER TABLE users RENAME COLUMN passdata TO _passhash`;
  `ALTER TABLE users OWNER TO ${process.env.PGUSER}`,
  `CREATE TABLE IF NOT EXISTS settings (
id SERIAL PRIMARY KEY,
title text not null default 'Persona',
mainperson integer not null default 1,
lang integer not null default 0
)`,
  'INSERT INTO settings (mainperson) VALUES(1)',
  `ALTER TABLE settings OWNER TO ${process.env.PGUSER}`,
  `CREATE TABLE books (
id SERIAL PRIMARY KEY,
title text not null,
published integer not null,
editors integer[] NULL,
works integer[] NULL
)`,
  `ALTER TABLE books OWNER TO ${process.env.PGUSER}`,
  `CREATE TABLE IF NOT EXISTS acts (
id SERIAL PRIMARY KEY,
title text not null,
parent integer
)`,
  `ALTER TABLE acts OWNER TO ${process.env.PGUSER}`,
  // the table should have at least 1 item to enable UI
  'INSERT INTO acts (title) VALUES(\'test\')',

  `CREATE TABLE IF NOT EXISTS refs (
id SERIAL PRIMARY KEY,
parent integer,
title text,
content text,
reftype integer NOT NULL DEFAULT 0,
pages text[],
authors integer[] NULL
)`,

  `ALTER TABLE refs OWNER TO ${process.env.PGUSER}`,
  // the table should have at least 1 item to enable UI
  'INSERT INTO refs (title) VALUES(\'test\')',
  `CREATE TABLE IF NOT EXISTS facts (
id SERIAL PRIMARY KEY,
stamp timestamp,
agent integer,
datedesc text,
place text,
title text,
acts integer[] NULL,
persons1 integer[] NULL,
persons2 integer[] NULL,
works integer[] NULL,
books integer[] NULL,
refs integer[] NULL,
comment text,
media integer,
relfact integer
relfacttype text
)`,
  `ALTER TABLE facts OWNER TO ${process.env.PGUSER}`,
  `CREATE TABLE IF NOT EXISTS logs (
id SERIAL PRIMARY KEY,
created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
user_id integer not null,
data0 json,
data1 json,
table_name text not null,
record_id integer not null
)`,
  `ALTER TABLE logs OWNER TO ${process.env.PGUSER}`,
  `CREATE TABLE IF NOT EXISTS genres (
id SERIAL PRIMARY KEY,
title text
)`,
  `ALTER TABLE genres OWNER TO ${process.env.PGUSER}`,
];

let tablesResult = await pool.query(databaseQuery);

if (!tablesResult.rows.length) {
  console.log('initializing database: started');
  try {
    await pool.query('BEGIN');
    try {
      for (let i = 0; i < tablesQueries.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await pool.query(tablesQueries[i]);
      }
      await pool.query('COMMIT');
      tablesResult = await pool.query(databaseQuery);
      console.log('initializing database: done');
    } catch (error) {
      await pool.query('ROLLBACK');
    }
  } catch (error) {
    console.log('initializing database: error\n', error);
  }
}

const dbStructure = {};

// eslint-disable-next-line no-restricted-syntax
for (const row of tablesResult.rows) {
  // eslint-disable-next-line no-unused-expressions
  dbStructure[row.table_name]
    ? dbStructure[row.table_name][row.column_name] = row
    : dbStructure[row.table_name] = { [row.column_name]: row };
}
const selectables = {};
// eslint-disable-next-line no-restricted-syntax
for (const table of Object.keys(dbStructure)) {
  selectables[table] = ['SELECT',
    Object.values(dbStructure[table])
      .filter((x) => x.column_name.charAt(0) !== '_')
      .map((x) => x.column_name)
      .join(', '),
    'FROM', table, ' '].join(' ');
} // columns with names starting with _underscore are not exposed for client code!
// console.log(selectables);
// console.log(dbStructure);

export default {
  async deleteData(table, id, user) {
    const idInt = parseInt(id, 10);
    if (table in dbStructure && idInt) {
      try {
        await pool.query('BEGIN');
        try {
          const selectResult = await pool.query(`${selectables[table]} WHERE id = ${id}`);
          const stored = selectResult.rows[0];
          delete stored.id;

          const queryResult = await pool.query(`DELETE FROM ${table} WHERE id=${id} RETURNING id`);
          //   const resultId = queryResult.rows[0].id;
          const logQuery = 'INSERT INTO logs (user_id, table_name, record_id, data0) VALUES($1, $2, $3, $4) RETURNING id';
          // const logResult =
          await pool.query(logQuery, [user.id, table, idInt, stored]);
          await pool.query('COMMIT');
          return queryResult.rows[0];
        } catch (error) {
          await pool.query('ROLLBACK');
          return { error };
        }
      } catch (error) {
        return { error };
      }
    }
    return { error: 'bad query' };
  },
  async getData(table, id, offset, limit) {
    const off = parseInt(offset, 10) || 0;
    const lim = parseInt(limit, 10) || 5000;
    if (table in dbStructure) {
      const idInt = parseInt(id, 10);
      const params = idInt
        ? [`${selectables[table]} WHERE id = $1`, [idInt]]
      // [selectables[table] + (["settings", "acts"].includes(table) ? "": "ORDER BY id DESC")];
        : [`${selectables[table]} ORDER BY id DESC OFFSET ${off} LIMIT ${lim}`];
      const result = await pool.query(...params);
      return result.rows;
    }
    return { error: 'bad query' };
  },
  async setData(datum, table, user) {
    const data = datum;
    // console.log(data);
    if (table in dbStructure) {
      const dbData = dbStructure[table];
      // console.log("data", data, dbData);
      const record = {};
      const meta = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(data)) {
        if (key in dbData) {
          if (dbData[key].column_default && dbData[key].column_default.includes('nextval')) {
            meta[key] = data[key];
          } else if (dbData[key].data_type === 'integer') {
            // console.log(`${key}${data[key]}`, typeof data[key]);
            record[key] = data[key] === null || (typeof data[key] === 'string' && !data[key])
              ? 'null' : parseInt(data[key], 10);
          } else if (dbData[key].data_type === 'ARRAY') {
            if (data[key] && data[key].length) {
              record[key] = `'{${data[key].join(',')}}'`;
            } else {
              record[key] = 'null';
            }
          } else if (dbData[key].data_type === 'boolean') {
            record[key] = Boolean(data[key]);
          } else { // string
            if (data[key] && dbData[key].data_type !== 'json') {
              data[key] = data[key].trim();
            }
            // check for well-formed string && prevent SQLi
            record[key] = pgFormat.literal(data[key]);
          }
          // console.log("key", key, data[key], dbData[key]);
        }
      }
      let query = '';
      let stored = {};
      delete data.id;

      if ('id' in meta && meta.id) {
        const pairs = Object.keys(record).map((key) => `${key} = ${record[key]}`).join(', ');
        const sel = `SELECT ${Object.keys(record).join(', ')} FROM ${table} WHERE id = ${meta.id}`;
        try {
          stored = (await pool.query(sel))?.rows?.shift();

          if (JSON.stringify(data) !== JSON.stringify(stored)) {
            query = `UPDATE ${table} SET ${pairs} WHERE id = ${meta.id} RETURNING id`;
          }
        } catch (error) {
          return { error };
        }
      } else {
        query = `INSERT INTO ${table} (${Object.keys(record).join(', ')}) VALUES(${Object.values(record).join(', ')}) RETURNING id`;
      }

      if (query) {
        try {
          await pool.query('BEGIN');
          try {
            // console.log(query);
            const queryResult = await pool.query(query);
            const resultId = queryResult.rows[0].id;
            const logQuery = 'INSERT INTO logs (user_id, table_name, record_id, data0, data1) VALUES($1, $2, $3, $4, $5) RETURNING id';
            // const logResult =
            await pool.query(logQuery, [user.id, table, resultId, stored, data]);
            // console.log(logQuery, logResult);
            // return resultId;
            await pool.query('COMMIT');
            return queryResult.rows[0];
          } catch (error) {
            await pool.query('ROLLBACK');
            return { error };
          }
        } catch (error) {
          return { error };
        }
      } else {
        console.log('...');
        return { id: meta.id };
      }
    } else {
      return { error: 'bad query' };
    }
  },

  async getUserDataByID(id) {
    const res = await pool.query(`${selectables.users}WHERE id = $1 AND activated = TRUE`, [id]);
    return res.rows[0];
  },
  async getUserData(email, pwd) {
    if (!email) { return { error: 'email' }; }
    if (!pwd) { return { error: 'password' }; }

    // console.log("email/pwd", email, pwd);
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length) {
      const data = res.rows[0];
      // console.log("userdata", data);
      // console.log("pass/hash", pwd, data._passhash);
      if (data.activated) {
        const result = await bcrypt.compare(pwd, data._passhash);
        delete data._passhash;
        // console.log("pass/hash result", result);
        return result ? data : { error: 'password' };
      }
      return { error: 'user status' };
    }
    return { error: 'email' };
    // return { error: 'unknown' };
  },
  async createUser(data, isActivated = false) {
    console.log('create user', data);
    let privs = data?.privs;
    let active = isActivated;
    const usersData = await pool.query('SELECT * FROM users');
    if (usersData.rows.length) {
      if (usersData.rows.filter((x) => x.email === data.email).length) {
        return { error: 'email not unique' };
      }
    } else {
      // if users table is empty it means it is first run and we have to create admin user
      privs = 1;
      active = true;
      console.log('create admin');
    }
    const pwd = passGen.generate(passOptions);
    console.log('make hash');
    const hash = await bcrypt.hash(pwd, saltRounds);
    console.log('ready');
    // console.log(pwd, hash);
    const result = await pool.query('INSERT INTO users (firstname, lastname, email, sex, privs, _passhash, activated) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id', [data.firstname, data.lastname, data.email, data.sex, privs, hash, active]);
    if (result.rows.length === 1) {
      return { message: pwd };
    }
    return { error: 'user' };
  },
  async resetPassword(currentUser, id) {
    if (currentUser.privs === 1) {
      console.log(`User ${currentUser.id} requested to reset password for user ${id}`);
      try {
        const pwd = passGen.generate(passOptions);
        const hash = await bcrypt.hash(pwd, saltRounds);
        await pool.query('UPDATE users SET _passhash = $2 WHERE id = $1', [id, hash]);
        return { message: pwd, id };
      } catch (error) {
        console.error(error);
      }
    }
    return { error: 'Operation is allowed only for administrators' };
  },
  async getStats() {
    return Object.fromEntries((await Promise.all(Object.keys(dbStructure).map((t) => pool.query(`SELECT '${t}' as table, COUNT(*) FROM ${t}`)))).map((x) => x.rows.shift()).map((x) => [x.table, Number(x.count)]));
  },
};
