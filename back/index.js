'use strict';

import path from 'path'
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
// import session from 'cookie-session'
import passport from 'passport'
import passportLocal from 'passport-local'
import dotenv from 'dotenv'
import db from './db.js';

dotenv.config();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LocalStrategy = passportLocal.Strategy;

(async () => {

	const app = express();
	const port = process.env.PORT || 3555;

	passport.use(new LocalStrategy( {
      usernameField: "email",
      passwordField: "password"
    },
	  async function(id, password, done) {

		const userData = await db.getUserData(id, password);
		// console.log("userdata", userData);

		if (userData && Object.keys(userData).length && !userData.hasOwnProperty("error") ) {
			console.log("user " + id + " SUCCESS");
			return done(null, userData);
		} else {
			console.log(`login attempt as [${id}]•[${password}]►${userData.error}◄`);
			return done(null, false, userData);
		}
	  }
	));


	passport.serializeUser(function(user, cb) {
		console.log("ser", user);
		if(user) {
			cb(null, user.id);
		}
	 });
	passport.deserializeUser(async function(id, cb) {
		console.log("deser", id);
	  let user = {
		  id: 1
		};
	  cb(null, user);
	});


	app.use(passport.initialize());
	app.use(db.expressPgSession());
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
	 app.get('/api/get/:table', async (req,res) => {
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


	app.get('/api/data', async (req,res) => { res.json({"hello": "test"}) });



	// app.get('/', async(req,res) => {
		// res.sendFile(path.join(__dirname, 'public', 'index.html'));
	// });
	app.get('/admin', async(req,res) => {
		if (req.isAuthenticated()){
			res.sendFile(path.join(__dirname, 'public', 'admin.html'));
		} else {
			res.redirect('/login');
		}
	});

// app.get('/login', passport.authenticate('local', { successRedirect: '/full' }));
// 	app.post('/test', function(req, res, next) {
// 		console.log("login");
// 	  passport.authenticate('local', function(err, user, info) {
// 		if (err) { return next(err); }
// 		console.log("login data: user", user, "info", info, "err", err);
// 		if (!user) {
// 			// return res.status(400).send([user, "Cannot log in", info]);
// 			// return res.redirect('/login');
// 			res.json({});
// 		}
// 		req.logIn(user, function(err) {
// 		  if (err) { return next(err); }
// 		  return res.json(user);
// 		});
// 	  })(req, res, next);
// });

// app.post('/api/user/login',
//   passport.authenticate('local', { failWithError: true }),
//   function(req, res, next) {
//     // Handle success
//     // return res.send({ success: true, message: 'Logged in' })
// 		return res.json({ id: req.user });
//   },
//   function(err, req, res, next) {
//     // Handle error
// 		// console.log("error", res);
// 		// console.log(JSON.stringify(res.res.route));
// 		// console.log("error", req.user, err);
//     // return res.status(401).send({ success: false, message: err })
//     return res.status(200).json({ message: "no"});
//   }
// );
//


	app.post('/api/user/login', (req, res, next) => {
	  passport.authenticate('local', (err, user, info) => res.json( user === false ? info : user ))(req, res, next);
	});

	app.get('/api/logout', (req, res) => {
		console.log("logging out");
		req.logout();
		res.redirect('/login');
	});

	app.listen(port);
	console.log("Running at Port "+ port);
})()
