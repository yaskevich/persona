import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import jwt from 'jsonwebtoken';
import history from 'connect-history-api-fallback';
import { fileURLToPath } from 'url';
import db from './db.js';
import nlp from './nlp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const textsDir = path.join(__dirname, 'texts');
const filesDir = path.join(__dirname, 'files');
const imptdName = '.imported';
const imptd = path.join(filesDir, imptdName);

if (!process.env.JWT_SECRET) {
  console.error('Error: secret key should be provided as an environment variable!');
  process.exit(1);
}
const __package = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const writeText = (html) => {
  const hash = crypto.createHash('sha256').update(html).digest('hex');
  const filePath = path.join(textsDir, hash);
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, html);
    } catch (err) {
      console.error(err);
    }
  }
  return hash;
};

const importFiles = async () => {
  let filesToIgnore = '';
  if (fs.existsSync(imptd)) {
    filesToIgnore = fs.readFileSync(imptd, 'utf8');
  } else {
    fs.writeFileSync(imptd, '');
  }

  const files = fs.readdirSync(filesDir);
  const persons = Object.fromEntries((await db.getData('persons')).map((x) => [`${x.firstname} ${x.lastname}`, x.id]));

  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of files) {
    const sourcePath = path.join(filesDir, fileName);
    if (fileName !== imptdName) {
      if (filesToIgnore.includes(fileName)) {
        // console.log('IGNORE', fileName);
      } else {
        const [author, title] = fileName.split('=');
        console.log(author, persons[author], title);
        // check whether this author has this work
        const html = fs.readFileSync(sourcePath, 'utf8');
        const hash = writeText(html);
        // eslint-disable-next-line no-await-in-loop
        await db.setData({ id: 0 }, 'works', { title, authors: [persons?.[author] || null], hash });
        fs.appendFileSync(imptd, `${fileName}\n`);
      }
    }
  }
};

(async () => {
  const app = express();
  const port = process.env.PORT || 8080;

  fs.mkdirSync(textsDir, { recursive: true });
  fs.mkdirSync(filesDir, { recursive: true });
  await importFiles();

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
  app.use(bodyParser.json({ limit: '10mb' }));
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

  app.get('/api/tokens', auth, async (req, res) => {
    res.json(await db.getTokensCount(req.user));
  });

  app.post('/api/text', auth, async (req, res) => {
    const { text, ...rest } = req.body;
    if (text && rest?.id) {
      const info = await db.getData('works', { id: req.body.id });
      const { hash } = info.shift();
      // console.log(info);
      const newHash = writeText(text);
      if (hash !== newHash) {
        if (hash) {
          const filePath = path.join(textsDir, hash);
          const filePath2 = path.join(textsDir, `${hash}.conll`);
          if (fs.existsSync(filePath)) {
            console.log('remove');
            fs.unlinkSync(filePath);
          }
          if (fs.existsSync(filePath2)) {
            console.log('remove2');
            fs.unlinkSync(filePath2);
          }
        }
        res.json(await db.setHash(req.user, newHash, rest.id));
        return;
      }
    }
    res.json({});
  });

  app.get('/api/text', auth, async (req, res) => {
    if (req.query.id) {
      try {
        const filePath = path.join(textsDir, req.query.id);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          res.send(content);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    res.send('');
  });

  app.get('/api/analyze', auth, async (req, res) => {
    const props = await db.getData('works', req.query);
    const {
      hash, id, title, yeardate, authors
    } = props.shift();
    const authorsInfo = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const person of authors) {
      // eslint-disable-next-line no-await-in-loop
      const author = (await db.getData('persons', { id: person }))?.shift();
      authorsInfo.push(`${author.lastname}, ${author.firstname} [${['n', 'm', 'f'][author.sex]}]`);
    }

    let result = 0;
    if (hash) {
      const filePath = path.join(textsDir, hash);
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(new Date().toUTCString(), 'sent to API');
      let conll = await nlp.udpipe(content, 'bel');
      console.log(new Date().toUTCString(), 'conll received');
      conll = `# text_id = ${id}
# hash = ${hash}
# authors = ${authorsInfo.join('; ')}
# title = ${title}
# lang = be
# origyear = ${yeardate}
# lang_var = be-BY
${conll}`;

      fs.writeFileSync(`${filePath}.conll`, conll);
      console.log(new Date().toUTCString(), 'written');
      const parsed = nlp.conllToArray(conll);
      result = await db.saveCorpus(req.user, id, parsed);
      console.log(new Date().toUTCString(), 'saved');
    }
    res.json({ tokens: result });
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
    console.log('POST params', req.params, 'payload', req.body);
    if (req.params.table === 'users' && (!(req.user.id === req.body.id || req.user.privs === 1))) {
      return res.json({ error: 'access denied' });
    }
    return res.json(req.params.table === 'relations'
      ? await db.saveRelation(req.user, req.body)
      : await db.setData(req.user, req.params.table, req.body));
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
