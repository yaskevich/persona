'use strict';

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool();

export default {
	async getPersons(){
		const res = await pool.query('select * from persons');
        return res.rows;
	},
};
