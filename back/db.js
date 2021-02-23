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


export default {
	async getPersons(){
		const res = await pool.query('select * from persons');
        return res.rows;
	},
	async createPerson(data){
		const res = await pool.query(`INSERT INTO persons (firstName, lastName, patroName, sex, wikidata) VALUES($1, $2, $3, $4, $5) RETURNING id`, [data.firstName, data.lastName, data.patroName, data.sex, data.wikidata]);
		// res.rows[0].id;
    return res.rows;
	},
};
