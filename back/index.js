'use strict';

import path from 'path'
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
// import session from 'express-session'
import passport from 'passport'
import passportLocal from 'passport-local'
import dotenv from 'dotenv'
import db from './db.js';
// import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LocalStrategy = passportLocal.Strategy;

(async () => {

	const app = express();
	const port = process.env.PORT || 3555;

	passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" },
	  async function(id, password, done) {
			const userData = await db.getUserData(id, password);
			// console.log("userdata", userData);
			if (userData && Object.keys(userData).length && !userData.hasOwnProperty("error") ) {
				console.log(id, "<SUCCESS>");
				return done(null, userData);
			} else {
				console.log(`login attempt as [${id}]•[${password}]►${userData.error}◄`);
				return done(null, false, userData);
			}
	  })
	);

	passport.serializeUser(function(user, cb) {
		console.log("ser", user);
		if(user) {
			cb(null, user.id);
		}
	 });
	passport.deserializeUser(function(id, cb) {
		console.log("deser", id);
	  let user = {
		  id: 1
		};
	  cb(null, user);
	});

	function ifAuthenticatedOnly(req, res, next) {
	  if (!req.isAuthenticated()) {
	    return res.status(401).send({"error": "access denied"});
	  }
	  next();
	}

	// var corsOption = {
	//   origin: true,
	//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	//   credentials: true,
	// };
	// app.set('trust proxy', 1);
	// app.use(cors(corsOption));
	app.use(passport.initialize());
	app.use(db.expressPgSession());
// 	app.use(session({
//   name: 'session',
//   keys: ['key1', 'key2']
// }));
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }))
	app.use(passport.session());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));
	// ['path', 'altPath'].forEach(function(path) {
	  // app.get(path, function(req, res) { etc. });
	// });

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

	//  app.get('/api/get/:table', async (req,res) => {
	// 	console.log("here");
 	// 	res.json({});
 	// });
//
	 // app.get('/api/get/:table', cors({credentials: true, origin: 'http://localhost:3555'}), ifAuthenticatedOnly, async (req,res) => {
	 app.get('/api/get/:table', ifAuthenticatedOnly, async (req,res) => {

		 console.log(req.cookies)

		    let options = {
		        maxAge: 1000 * 60 * 15, // would expire after 15 minutes
		        httpOnly: true, // The cookie only accessible by the web server
		        // signed: true // Indicates if the cookie should be signed
		    }

		    // Set cookie
		    res.cookie('cookieName', 'lal12ke', options) // options is optional
		    // res.send('')

		console.log(req.params, req.query);
		const id = parseInt(req.query['id']);
		const table = req.params['table'];
		res.json(await db.getData(table, id));
	});

	app.post('/api/person/set', async (req,res) => {
		console.log(req.body);
		const result = await db.setPerson(req.body);
		res.json(result);
	});
// cors({credentials: true, , origin: 'http://localhost:3555'}),
	app.post('/api/user/login', (req, res, next) => {
	  passport.authenticate('local', (err, user, info) => res.json( user === false ? info : user ))(req, res, next);
	});

	app.get('/api/logout', (req, res) => {
		console.log("logging out");
		req.logout();
		// res.redirect('/login');
	});

	app.listen(port);
	console.log("Running at port "+ port);
})()
