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


export default {
	async getPersons(){
		const res = await pool.query('select * from persons');
        return res.rows;
	},
};
