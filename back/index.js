import fs from 'fs';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import jwt from 'jsonwebtoken';
import history from 'connect-history-api-fallback';
// import { fileURLToPath } from 'url';
import db from './db.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
if (!process.env.JWT_SECRET) {
  console.error('Error: secret key should be provided as an environment variable!');
  process.exit(1);
}
const __package = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

(async () => {
  const app = express();
  const port = process.env.PORT || 8080;

  const createToken = (user) => jwt.sign({
    iss: 'persona',
    sub: user.id,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 1)
  }, process.env.JWT_SECRET);

  const secretOrKey = process.env.JWT_SECRET;
  if (!secretOrKey) {
    console.log('Application secret cannot be empty! Exiting...');
    process.exit();
  }

  const jwtFromRequest = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken();

  passport.use(new passportJWT.Strategy({ jwtFromRequest, secretOrKey }, async (token, next) => next(null, (await db.getUserDataByID(token.sub)) || false)));

  const auth = passport.authenticate('jwt', { session: false });
  app.use(compression());
  app.set('trust proxy', 1);
  app.use(passport.initialize());
  // app.use(passport.session());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(history());
  app.use(express.static('public'));

  app.post('/api/user/login', async (req, res) => {
    const userData = await db.getUserData(req.body.email, req.body.password);
    if (userData && Object.keys(userData).length && !userData?.error) {
      console.log(req.body.email, '<SUCCESS>');
      userData.token = createToken(userData);
      res.json(userData);
    } else {
      console.log(`login attempt as [${req.body.email}]•[${req.body.password}]►${userData.error}◄`);
      res.json(userData);
    }
  });

  app.get('/api/user/info', auth, async (req, res) => {
    const settings = await db.getData('settings', { id: 1 });
    const stats = await db.getStats();
    res.json(Object.assign(req.user, {
      settings: settings?.[0], stats, commit: process.env.COMMIT, server: __package.version,
    }));
  });

  app.post('/api/user/reg', async (req, res) => {
    res.json(await db.createUser({ privs: 5, ...req.body }, false));
  });

  app.post('/api/user/add', auth, async (req, res) => {
    res.json(await db.createUser(req.body, req.user.privs === 1));
  });

  app.post('/api/user/reset', auth, async (req, res) => {
    res.json(await db.resetPassword(req.user, req.body.id));
  });

  app.post('/api/relation', auth, async (req, res) => {
    res.json(await db.saveRelation(req.user, req.body));
  });

  app.delete('/api/relation', auth, async (req, res) => {
    res.json(await db.removeRelation(req.user, req.body));
  });

  app.get('/api/relation', auth, async (req, res) => {
    res.json(await db.getRelation(req.query.id));
  });

  app.get('/api/relations', auth, async (req, res) => {
    res.json(await db.getRelationsForPerson(req.query.id));
  });

  app.post('/api/:table', auth, async (req, res) => {
    console.log('POST params', req.params, 'query', req.query);
    if (req.params.table === 'users' && (!(req.user.id === req.body.id || req.user.privs === 1))) {
      return res.json({ error: 'access denied' });
    }
    return res.json(req.params.table === 'relations'
      ? await db.saveRelation(req.user, req.body)
      : await db.setData(req.user, req.body, req.params.table));
  });

  app.delete('/api/:table/:id', auth, async (req, res) => {
    console.log('DELETE params', req.params, 'query', req.query);
    res.json(await db.deleteData(req.user, req.params.table, req.params.id));
  });

  app.delete('/api/relations', auth, async (req, res) => {
    console.log('DELETE relations query', req.query);
    res.json(await db.deleteConnection(req.user, req.query));
  });

  app.get('/api/:table', auth, async (req, res) => {
    console.log('GET params', req.params, 'query', req.query);
    res.json(await db.getData(req.params.table, req.query));
  });

  app.listen(port);
  console.log(`Running at port ${port}`);
})();
