'use strict';

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool();

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



const tables = ['persons', 'works'];

export default {
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

	async createUser(data){
		const res = await pool.query(`INSERT INTO users (firstname, lastname, email, sex, privs, passdata) VALUES($1, $2, $3, $4, $5) RETURNING id`, [data.firstname, data.lastname, data.email, data.sex, data.privs, data.passdata]);
    return res.rows;
	},
};
