'use strict';

import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from "passport-jwt";
import jwt from 'jsonwebtoken';
import db from './db.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
	const app = express();
	const port = process.env.PORT || 3001;
	const JWTStrategy   = passportJWT.Strategy;
	const ExtractJWT = passportJWT.ExtractJwt;

	const createToken = (user) => {
	  return jwt.sign({
	    iss: 'yaskevich',
	    sub: user.id,
	    iat: new Date().getTime(),
	    exp: new Date().setDate(new Date().getDate() + 1)
	  }, process.env.JWT_SECRET);
	};

	const strategy  = new JWTStrategy({
		  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
		  secretOrKey   : process.env.JWT_SECRET
		}, function (jwtPayload, done) {
		  return db.getUserDataByID(jwtPayload.sub)
		    .then(user => { return done(null, user); })
			  .catch(err => { return done(err); });
		});

	passport.use(strategy);
	// app.set('trust proxy', 1);
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));

	app.post('/api/person/add', async (req,res) => {
		console.log(req.body);
		const result = await db.createPerson(req.body);
		res.json(result);
	 });

	app.post('/api/work/add', async (req,res) => {
		console.log(req.body);
		const result = await db.createWork(req.body);
		res.json(result);
	 });

	app.post('/api/user/add', async (req,res) => {
		// console.log(req.body);
		const result = await db.createUser(req.body);
		res.json(result);
	 });

	 app.get('/api/get/:table', passport.authenticate('jwt',{session: false}), async (req,res) => {
		console.log("table get params", req.params, "query", req.query);
		const id = parseInt(req.query['id']);
		const table = req.params['table'];
		res.json(await db.getData(table, id));
	});

	app.post('/api/person/set', async (req,res) => {
		console.log(req.body);
		const result = await db.setPerson(req.body);
		res.json(result);
	});

	app.post('/api/user/login', async(req, res) => {
		const userData = await db.getUserData(req.body["email"], req.body["password"]);
		if (userData && Object.keys(userData).length && !userData.hasOwnProperty("error") ) {
			console.log(req.body["email"], "<SUCCESS>");
			const token = createToken(userData);
			userData["token"] = token;
			res.json(userData);
		} else {
			console.log(`login attempt as [${id}]•[${password}]►${userData.error}◄`);
			res.json(userData);
		}
	});

	app.get('/api/logout', (req, res) => {
		console.log("logging out");
		req.logout();
		// res.redirect('/login');
	});

	app.listen(port);
	// console.log(`Running at port ${port}`);
})()
