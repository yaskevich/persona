import path from 'path'
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import session from 'cookie-session'
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

	passport.use(new LocalStrategy(
	  function(id, password, done) {
		let user = {"id": id};
		if (id === process.env.USER_ID && password === process.env.USER_PASSWORD) {
			console.log("user " + id + " authenticated");
			return done(null, user);
		} else {
			console.log("login attempt as [" + id + "]::[" + password + "]");
			return done(null,false);
		}
	  }
	));
	passport.serializeUser(function(user, cb) { cb(null, user.id); });
	passport.deserializeUser(async function(id, cb) {
	  let user = {"id": id};
	  cb(null, user);
	});
	app.use(session({
	  secret: 'wqddqad',
	  resave: false,
	  saveUninitialized: true,
	  cookie: { secure: true }
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));
	// ['path', 'altPath'].forEach(function(path) {
	  // app.get(path, function(req, res) { etc. });
	// });
	app.get('/cool.js', async (req,res) => { res.json({}) });

	app.post('/api/person/add', async (req,res) => {
		const result = await db.createPerson();
		 res.json(result)
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
	app.get('/login', function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
		if (err) { return next(err); }
		console.log(user, info);
		if (!user) {
			return res.sendFile(path.join(__dirname, 'public', 'login.html'));
			// return res.redirect('/login');
		}
		req.logIn(user, function(err) {
		  if (err) { return next(err); }
		  return res.redirect('/full');
		});
	  })(req, res, next);
});

	app.get('/logout', (req, res) => {
		console.log("logging out");
		req.logout();
		res.redirect('/login');
	});

	app.listen(port);
	console.log("Running at Port "+ port);
})()
