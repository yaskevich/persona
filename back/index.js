'use strict';

import path from 'path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import jwt from 'jsonwebtoken';
import db from './db.js';
import history from 'connect-history-api-fallback';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!process.env.JWT_SECRET){
	console.error('Error: secret key should be provided as an environment variable!');
	process.exit(1);
}

(async () => {
	const app = express();
	const port = process.env.PORT || 3001;
	const JWTStrategy   = passportJWT.Strategy;
	const ExtractJWT = passportJWT.ExtractJwt;

	const createToken = (user) => {
	  return jwt.sign({
	    iss: 'persona',
	    sub: user.id,
	    iat: new Date().getTime(),
	    exp: new Date().setDate(new Date().getDate() + 1)
	  }, process.env.JWT_SECRET);
	};

	const strategy  = new JWTStrategy(
		{
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey   : process.env.JWT_SECRET
		},
		(jwtPayload, done) =>
			db.getUserDataByID(jwtPayload.sub)
				.then(user => { return done(null, user); })
				.catch(err => { return done(err); })
		);

	passport.use(strategy);
	const auth = passport.authenticate('jwt', {session: false});
	app.use(compression());
	app.set('trust proxy', 1);
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(history());
	app.use(express.static('public'));

	app.post('/api/user/login', async(req, res) => {
		const userData = await db.getUserData(req.body['email'], req.body['password']);
		if (userData && Object.keys(userData).length && !userData.hasOwnProperty('error') ) {
			console.log(req.body['email'], '<SUCCESS>');
			const token = createToken(userData);
			userData['token'] = token;
			res.json(userData);
		} else {
			console.log(`login attempt as [${req.body['email']}]•[${req.body['password']}]►${userData.error}◄`);
			res.json(userData);
		}
	});

	app.get('/api/user/logout', auth, async(req, res) => {
		console.log('logging out');
		// You can add 'issue time' to token and maintain 'last logout time' for each user on the server.
		// When you check token validity, also check 'issue time' be after 'last logout time'.
		// res.redirect('/login');
	});

	app.get('/api/user/info', auth, async(req,res) => {
		const settings = await db.getData("settings", 1);
		res.json(Object.assign(req.user, {"settings": settings?.[0]}));
	 });

	app.post('/api/user/reg', async(req,res) => {
		const result = await db.createUser(Object.assign({"privs": 5}, req.body), false);
		res.json(result);
	});

	app.post('/api/user/add', auth, async(req,res) => {
		const result = await db.createUser(req.body, true);
		res.json(result);
	});

	app.post('/api/x/:table', auth, async(req,res) => {
		console.log('POST params', req.params, 'query', req.query);
		if (req.params['table'] === "users" && (!(req.user.id === req.body.id || req.user.privs == 1))){
			return res.json({"error": "privs"});
		}
		res.json(await db.setData(req.body, req.params['table'], req.user));
	 });

	app.delete('/api/:table/:id', auth, async(req,res) => {
		console.log('DELETE params', req.params, 'query', req.query);
		res.json(await db.deleteData(req.params['table'], req.params['id'], req.user));
	});

	app.get('/api/:table', auth, async(req,res) => {
	 // console.log('GET params', req.params, 'query', req.query);
	 res.json(await db.getData(req.params['table'], req.query['id']));
 });

	app.listen(port);
	// console.log(`Running at port ${port}`);
})()
