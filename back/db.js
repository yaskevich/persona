'use strict';

import bcrypt from 'bcrypt';
const saltRounds = 8;

import passGen from 'generate-password';
const passOptions = {	length: 18, numbers: true, uppercase: false, excludeSimilarCharacters: true, strict: true , symbols: false };

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool();


// import * as pgSession from 'connect-pg-simple';
import expressSession from 'express-session';
import connectPgSimple from 'connect-pg-simple';

`CREATE TABLE persons (
	id SERIAL PRIMARY KEY,
	firstName text not null,
	lastName text,
	patroName text,
	sex integer,
	wikidata integer,
	features jsonb
)`;
`ALTER TABLE persons OWNER TO persona_user`;
`CREATE TABLE works (
	id SERIAL PRIMARY KEY,
	title text not null,
	genre text
)`;
`ALTER TABLE works OWNER TO persona_user`;
`CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	firstname text not null,
	lastname text not null,
	email text not null,
	sex integer not null,
	privs integer not null,
	passdata text not null
)`;
`ALTER TABLE users OWNER TO persona_user`;

`CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire")`;

`ALTER TABLE session OWNER TO persona_user`;

const tables = ['persons', 'works', 'users'];


const infoQuery  = `SELECT
   table_name,
   column_name,
   data_type
FROM
   information_schema.columns
WHERE
   table_name = $1`;

const infoQueryDB = `
SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog' AND
    schemaname != 'information_schema'`;


export default {
	expressPgSession(){
		const pgSession = connectPgSimple(expressSession);
	  const sessionSettings = {
			store: new pgSession({ pool : pool,}),
			secret: process.env.SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
			cookie:  { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
			 // cookie: { secure: true }
			};
			return expressSession(sessionSettings);
		// return new pgSession({
    // pool : pool,                // Connection pool
    // // tableName : 'user_sessions'   // Use another table-name than the default "session" one
		// });
		// return pgSession;
		// const pgs = pgSession.default(session);
		 // const pgs = pgSession(session);
	},

	async getData(table, id){
		if (tables.includes(table)) {
			const result  = id ? await pool.query('select * from ${table} where id = $1', [id]) :  await pool.query(`select * from ${table} ORDER BY id DESC`);
			return result.rows;
		} else {
			return {};
		}
	},
	async setPerson(data){
		const res = await pool.query('UPDATE persons SET firstName = $2, lastname = $3, patroname = $4, sex = $5, wikidata = $6 WHERE id = $1', [data.id, data.firstname, data.lastname, data.patroname, data.sex, data.wikidata]);
    return res.rows;
	},
	async createPerson(data){
		const res = await pool.query(`INSERT INTO persons (firstName, lastname, patroname, sex, wikidata) VALUES($1, $2, $3, $4, $5) RETURNING id`, [data.firstName, data.lastName, data.patroName, data.sex, data.wikidata||null]);
		// res.rows[0].id;
    return res.rows;
	},
	async createWork(data){
		const res = await pool.query(`INSERT INTO works (title, genre) VALUES($1, $2) RETURNING id`, [data.title, data.genre]);
    return res.rows;
	},
	async getUserData(email, pwd){
		if (email && pwd) {
			console.log("email/pwd", email, pwd);
			const res = await pool.query(`SELECT * FROM users where email = $1`, [email]);
			if (res.rows.length){
				const data = res.rows[0];
				console.log("userdata", data);
				console.log("pass/hash", pwd, data.passdata);
				const result = await bcrypt.compare(pwd, data.passdata);
				delete data.passdata;
				console.log("pass/hash result", result);
				return result ? data : {"error": "password"};
			} else {
				 return {"error": "email"};
			}
		} else {
			if (!email) { return {"error": "email"}; }
			else if (!pwd) { return {"error": "password"}; }
		}
		return {"error": "unknown"};
	},
	async createUser(data){
		console.log("create user");
		const pwd  = passGen.generate(passOptions);
		console.log("make hash");
		const hash = await bcrypt.hash(pwd, saltRounds);
		console.log("ready");

		// const resInfo = await pool.query(infoQuery, ['persons']);
		// console.log("info", resInfo.rows);
		// const resInfo = await pool.query(infoQueryDB);
		// console.log("info", resInfo.rows);
		console.log(pwd, hash);



		// const result = await bcrypt.compare('PASSWORD', hash)

		const res = await pool.query(`INSERT INTO users (firstname, lastname, email, sex, privs, passdata) VALUES($1, $2, $3, $4, $5, $6) RETURNING id`, [data.firstname, data.lastname, data.email, data.sex, data.privs, hash]);
    return res.rows;
		// return {pwd: pwd};
	},
};
