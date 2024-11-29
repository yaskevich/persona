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
  length: 18,
  numbers: true,
  uppercase: false,
  excludeSimilarCharacters: true,
  strict: true,
  symbols: false,
};

const { Pool } = pg;
const pool = new Pool();
// prevent formatting as a timestamp with zone
pg.types.setTypeParser(1114, (x) => x);

// const databaseQuery = `SELECT table_name FROM information_schema.columns
//  WHERE table_schema = 'public' group by table_name`;

const databaseQuery = `SELECT table_name, column_name, ordinal_position,
column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position`;

const databaseScheme = {

  persons: `
    id SERIAL PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT,
    patroname TEXT,
    sex INTEGER,
    wikidata INTEGER,
    note TEXT`,

  works: `
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    genre INTEGER,
    genrename TEXT,
    authors INTEGER[] NULL,
    hash TEXT,
    comment TEXT,
    yeardate INTEGER,
    parsed BOOLEAN`,

  users: `
    id SERIAL PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT NOT NULL,
    sex INTEGER NOT NULL,
    privs INTEGER NOT NULL,
    prefs JSON,
    _passhash TEXT NOT NULL,
    activated BOOLEAN NOT NULL DEFAULT FALSE`,

  settings: `
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Persona',
    mainperson INTEGER NOT NULL DEFAULT 1,
    lang INTEGER NOT NULL DEFAULT 0`,

  books: `
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    published INTEGER NOT NULL,
    editors INTEGER[] NULL,
    works INTEGER[] NULL`,

  acts: `
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    parent INTEGER`,

  refs: `
    id SERIAL PRIMARY KEY,
    parent INTEGER,
    title TEXT,
    content TEXT,
    reftype INTEGER NOT NULL DEFAULT 0,
    pages TEXT[],
    authors INTEGER[] NULL`,

  facts: `
    id SERIAL PRIMARY KEY,
    stamp TIMESTAMP,
    agent INTEGER,
    datedesc TEXT,
    place TEXT,
    title TEXT,
    acts INTEGER[] NULL,
    persons1 INTEGER[] NULL,
    persons2 INTEGER[] NULL,
    works INTEGER[] NULL,
    books INTEGER[] NULL,
    refs INTEGER[] NULL,
    comment TEXT,
    media INTEGER,
    relfact INTEGER,
    relfacttype TEXT`,

  logs: `
    id SERIAL PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    data0 JSON,
    data1 JSON,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL`,

  genres: `
    id SERIAL PRIMARY KEY,
    title TEXT`,

  reltypes: `
    id SERIAL PRIMARY KEY,
    name1 TEXT NOT NULL,
    name2 TEXT NOT NULL,
    bilateral BOOLEAN NOT NULL DEFAULT FALSE`,

  relships: `
    rel_id INTEGER NOT NULL,
    member1 INTEGER NOT NULL,
    member2 INTEGER NOT NULL,
    color TEXT NOT NULL DEFAULT '#B8B8B8'`,

  corpus: `
    wid INTEGER NOT NULL,
    sid INTEGER NOT NULL,
    tid INTEGER NOT NULL,
    form TEXT,
    lemma TEXT,
    upos TEXT,
    xpos TEXT,
    feats JSON,
    head INTEGER,
    deprel TEXT,
    deps TEXT,
    misc JSON`,

};

let tablesResult;
try {
  tablesResult = await pool.query(databaseQuery);
} catch (error) {
  console.error(error);
  pool.end();
  process.exit(1);
}

const tables = [...new Set(tablesResult.rows.map((x) => x.table_name))];

const prepareTable = async (args) => {
  const tableName = args[0];
  if (!tables.includes(tableName)) {
    console.log(`init table '${tableName}'`);
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${args[1]})`);
      await pool.query(`ALTER TABLE ${tableName} OWNER TO ${process.env.PGUSER}`);
    } catch (createError) {
      console.error(createError);
      console.error(`Issue with table '${tableName}'!`);
      throw createError;
    }
  }
};

const initDatabase = async () => {
  /* eslint-disable-next-line no-restricted-syntax */
  for (const table of Object.entries(databaseScheme)) {
    /* eslint-disable-next-line no-await-in-loop */
    await prepareTable(table);
    if (table[0] === 'settings') {
      // eslint-disable-next-line no-await-in-loop
      await pool.query('INSERT INTO settings (mainperson) VALUES(1)');
    } else if (table[0] === 'acts') {
      // the table should have at least 1 item to enable UI
      // eslint-disable-next-line no-await-in-loop
      await pool.query('INSERT INTO acts (title) VALUES(\'test\')');
    } else if (table[0] === 'refs') {
      // the table should have at least 1 item to enable UI
      // eslint-disable-next-line no-await-in-loop
      await pool.query('INSERT INTO refs (title) VALUES(\'test\')');
    }
  }
};

if (tables.length !== Object.keys(databaseScheme).length) {
  console.log(tables.length, Object.keys(databaseScheme).length);
  console.log('initializing database: started');
  try {
    await pool.query('BEGIN');
    try {
      await initDatabase();
      await pool.query('COMMIT');
      tablesResult = await pool.query(databaseQuery);
      console.log('initializing database: done');
    } catch (error) {
      console.log('Rolling back...');
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
    ? (dbStructure[row.table_name][row.column_name] = row)
    : (dbStructure[row.table_name] = { [row.column_name]: row });
}

const selectables = {};
// eslint-disable-next-line no-restricted-syntax
for (const table of Object.keys(dbStructure)) {
  selectables[table] = [
    'SELECT',
    Object.values(dbStructure[table])
      .filter((x) => x.column_name.charAt(0) !== '_')
      .map((x) => x.column_name)
      .join(', '),
    'FROM',
    table,
    ' ',
  ].join(' ');
} // columns with names starting with _underscore are not exposed for client code!
// console.log(selectables);
// console.log(dbStructure);

export default {
  async deleteData(user, table, id) {
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
  async getData(table, query) {
    const props = query;
    let off = 0;
    let lim = 5000;

    if (props?.off) {
      off = Number(props.off);
      delete props.off;
    }
    if (props?.lim) {
      lim = Number(props.lim);
      delete props.lim;
    }

    if (table in dbStructure) {
      const addon = Object.entries(props)
        .map((x) => (dbStructure[table][x[0]].data_type === 'ARRAY'
          ? `${Number(x[1])} = ANY(${String(x[0])})`
          : `${String(x[0])} = ${Number(x[1])}`))
        .join(' AND ');
      // console.log(dbStructure[table]);
      const params = addon
        ? [`${selectables[table]} WHERE ${addon}`] // [selectables[table] + (["settings", "acts"].includes(table) ? "": "ORDER BY id DESC")];
        : [`${selectables[table]} ORDER BY ${dbStructure[table]?.id ? 'id' : Object.keys(dbStructure[table])?.[0]} DESC OFFSET ${off} LIMIT ${lim}`];
      const result = await pool.query(...params);
      return result.rows;
    }
    return { error: 'bad query' };
  },
  async setData(user, datum, table) {
    const data = datum;
    // console.log(data);
    if (table in dbStructure) {
      const dbData = dbStructure[table];
      // console.log("data", data, dbData);
      const record = {};
      const meta = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(data)) {
        const dataType = dbData[key].data_type.toLowerCase();
        if (key in dbData) {
          if (dbData[key].column_default && dbData[key].column_default.includes('nextval')) {
            meta[key] = data[key];
          } else if (dataType === 'integer') {
            // console.log(`${key}${data[key]}`, typeof data[key]);
            record[key] = data[key] === null || (typeof data[key] === 'string' && !data[key]) ? 'null' : Number(data[key]);
          } else if (dataType === 'array') {
            if (data[key] && data[key].length) {
              record[key] = `'{${data[key].join(',')}}'`;
            } else {
              record[key] = 'null';
            }
          } else if (dataType === 'boolean') {
            record[key] = Boolean(data[key]);
          } else {
            // string
            if (data?.[key] && dataType !== 'json') {
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
        const pairs = Object.keys(record)
          .map((key) => `${key} = ${record[key]}`)
          .join(', ');
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
        query = `INSERT INTO ${table} (${Object.keys(record).join(', ')}) VALUES(${Object.values(record).join(
          ', '
        )}) RETURNING id`;
      }
      // console.log(query);
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
  async getRelation(id) {
    const query = 'SELECT * FROM relships WHERE rel_id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount;
  },
  async saveRelation(user, relation) {
    const query = 'INSERT INTO relships (rel_id, member1, member2) VALUES($1, $2, $3)';
    const result = await pool.query(query, [relation.rel_id, relation.member1, relation.member2]);
    return result.rowCount;
  },
  async deleteConnection(user, relation) {
    const query = 'DELETE FROM relships WHERE rel_id = $1 AND member1 = $2 AND member2 = $3';
    const result = await pool.query(query, [relation.rel_id, relation.member1, relation.member2]);
    return result.rowCount;
  },
  async getRelationsForPerson(id) {
    const res = await pool.query('SELECT * FROM relships WHERE member1 = $1 OR member2 = $1', [id]);
    return res.rows;
  },
  async getUserDataByID(id) {
    const res = await pool.query(`${selectables.users}WHERE id = $1 AND activated = TRUE`, [id]);
    return res.rows[0];
  },
  async getUserData(email, pwd) {
    if (!email) {
      return { error: 'email' };
    }
    if (!pwd) {
      return { error: 'password' };
    }

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
    const result = await pool.query(
      'INSERT INTO users (firstname, lastname, email, sex, privs, _passhash, activated) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [data.firstname, data.lastname, data.email, data.sex, privs, hash, active]
    );
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
    return Object.fromEntries(
      (await Promise.all(Object.keys(dbStructure).map((t) => pool.query(`SELECT '${t}' as table, COUNT(*) FROM ${t}`))))
        .map((x) => x.rows.shift())
        .map((x) => [x.table, Number(x.count)])
    );
  },
  async saveText(user, hash, id) {
    const result = await pool.query('UPDATE works SET hash = $2 WHERE id = $1', [id, hash]);
    return ({ hash, id, result: result.rowCount });
  },
};
