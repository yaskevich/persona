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
		const res = await pool.query('select * from persons ORDER BY id DESC');
        return res.rows;
	},
	async getPerson(id){
		const res = await pool.query('select * from persons where id = $1', [id]);
    return res.rows;
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
};
