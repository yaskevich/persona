'use strict';

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
const saltRounds = 8;

import passGen from 'generate-password';
const passOptions = {	length: 18, numbers: true, uppercase: false, excludeSimilarCharacters: true, strict: true , symbols: false };

import pg from 'pg';
import pgFormat from 'pg-format';
const { Pool } = pg;
const pool = new Pool();

`CREATE TABLE persons (
	id SERIAL PRIMARY KEY,
	firstName text not null,
	lastName varchar,
	patroName text,
	sex integer,
	wikidata integer
)`;
`ALTER TABLE persons OWNER TO ${process.env.PGUSER}`;
`CREATE TABLE works (
	id SERIAL PRIMARY KEY,
	title text not null,
	genre text
)`;
`ALTER TABLE works ADD authors integer[] NULL`;
`ALTER TABLE works OWNER TO ${process.env.PGUSER}`;
`CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	firstname text not null,
	lastname text not null,
	email text not null,
	sex integer not null,
	privs integer not null,
	_passhash text not null
)`;
// `ALTER TABLE users RENAME COLUMN passdata TO _passhash`;
`ALTER TABLE users OWNER TO ${process.env.PGUSER}`;
`CREATE TABLE settings (
	persona_id integer not null
)`;
`ALTER TABLE settings OWNER TO ${process.env.PGUSER}`;



const qry = await pool.query(`SELECT
	table_name, column_name, ordinal_position, column_default, is_nullable, data_type
	FROM information_schema.columns
	WHERE table_schema = 'public'
	ORDER BY table_name, ordinal_position`);

const dbStructure = {};

for(let row of qry.rows) {
	dbStructure[row.table_name] ?
		dbStructure[row.table_name][row.column_name] = row
		:
		dbStructure[row.table_name] = { [row.column_name]: row }
}
const selectables = {};
for (let table of Object.keys(dbStructure)) {
	selectables[table] = ["SELECT",
		Object.values(dbStructure[table])
		 .filter(x => x.column_name.charAt(0)!== '_')
		 .map(x => x.column_name)
		 .join(', '),
	 "FROM", table, ' '].join(' ');
} // columns with names starting with _underscore are not exposed for client code!

// console.log(selectables);
// console.log(dbStructure);

export default {
	async deleteData(table, id) {
		const idInt  = parseInt(id, 10);
		if (table in dbStructure && idInt) {
			try {
				const res = await pool.query(`DELETE FROM ${table} WHERE id=${id} RETURNING id`);
				return res.rows[0];
			} catch (error) {
				return {"error": error};
			}
		}
		return {"error": "bad query"};
	},
	async getData(table, id){
		if (table in dbStructure) {
			const idInt  = parseInt(id, 10);
			const params  = idInt ?
				[selectables[table] + "WHERE id = $1", [idInt]]
				:
				[selectables[table] + (table === "settings" ? "": "ORDER BY id DESC")];
			const result  = await pool.query(...params);
			return result.rows;
		}
		return {"error": "bad query"};
	},
	async setData(data, table){
		// console.log(data);
		if (table in dbStructure) {
			const dbData = dbStructure[table];
			// console.log("data", data, dbData);
			const record = {};
			const meta = {};
			for (let key of Object.keys(data)) {
				if (key in dbData){
					if (dbData[key]["column_default"] && dbData[key]["column_default"].includes("nextval")){
						meta[key] = data[key];
					} else {
						if (dbData[key]["data_type"] === "integer") {
							// console.log(`${key}${data[key]}`, typeof data[key]);
							record[key] = data[key] === null || (typeof data[key] === 'string' && !data[key]) ?
														'null' : parseInt(data[key], 10);
						} else { // string
							// trim
							if (data[key]) {
								data[key] = data[key].trim();
							}
							// check for well-formed string && prevent SQLi
							record[key] = pgFormat.literal(data[key]);
						}
					}
					// console.log("key", key, data[key], dbData[key]);
				}
			}
			let query  = '';
			if ("id" in meta && meta.id){
				const pairs  = Object.keys(record).map(key => `${key} = ${record[key]}`).join(", ");
				query  = `UPDATE ${table} SET ${pairs} WHERE id = ${meta.id} RETURNING id`;
				// const res = await pool.query('UPDATE persons SET firstName = $2, lastname = $3, patroname = $4, sex = $5, wikidata = $6 WHERE id = $1', [data.id, data.firstname, data.lastname, data.patroname, data.sex, data.wikidata]);
			} else {
				query  = `INSERT INTO ${table} (${Object.keys(record).join(', ')}) VALUES(${Object.values(record).join(', ')}) RETURNING id`;
				// const res = await pool.query(`INSERT INTO persons (firstName, lastname, patroname, sex, wikidata) VALUES($1, $2, $3, $4, $5) RETURNING id`, [data.firstName, data.lastName, data.patroName, data.sex, data.wikidata||null]);
			}
			console.log(query);
			try {
				const res = await pool.query(query);
				return res.rows[0];
			} catch (error) {
				return {"error": error};
			}
		}  else {
			return {"error": "bad query"};
		}
	},
	async createWork(data){
		// settings table_name// add default author in authors
		// years??
		const res = await pool.query(`INSERT INTO works (title, genre) VALUES($1, $2) RETURNING id`, [data.title, data.genre]);
    return res.rows;
	},
	async getUserDataByID(id){
		const res = await pool.query(selectables["users"] + "WHERE id = $1", [id]);
		return res.rows[0];
	},
	async getUserData(email, pwd){
		if (!email) { return {"error": "email"}; }
		else if (!pwd) { return {"error": "password"}; }

		// console.log("email/pwd", email, pwd);
		const res = await pool.query(`SELECT * FROM users where email = $1`, [email]);
		if (res.rows.length){
			const data = res.rows[0];
			// console.log("userdata", data);
			// console.log("pass/hash", pwd, data._passhash);
			const result = await bcrypt.compare(pwd, data._passhash);
			delete data._passhash;
			// console.log("pass/hash result", result);
			return result ? data : {"error": "password"};
		} else {
			 return {"error": "email"};
		}

		return {"error": "unknown"};
	},
	async createUser(data){
		console.log("create user");
		const pwd  = passGen.generate(passOptions);
		console.log("make hash");
		const hash = await bcrypt.hash(pwd, saltRounds);
		console.log("ready");
		// console.log(pwd, hash);
		const res = await pool.query(`INSERT INTO users (firstname, lastname, email, sex, privs, _passhash) VALUES($1, $2, $3, $4, $5, $6) RETURNING id`, [data.firstname, data.lastname, data.email, data.sex, data.privs, hash]);
    return res.rows;
	},
};
