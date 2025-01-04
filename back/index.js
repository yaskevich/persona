import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import jwt from 'jsonwebtoken';
import history from 'connect-history-api-fallback';
import { fileURLToPath } from 'url';
import crypto from 'node:crypto';
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

const importFiles = async () => {
  let filesToIgnore = '';
  if (fs.existsSync(imptd)) {
    filesToIgnore = fs.readFileSync(imptd, 'utf8');
  } else {
    fs.writeFileSync(imptd, '');
  }

  const files = fs.readdirSync(filesDir);
  const persons = Object.fromEntries((await db.getData('persons')).map((x) => [`${x.rendername ? x.rendername : `${x.firstname} ${x.lastname}`}`, x.id]));

  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of files) {
    const sourcePath = path.join(filesDir, fileName);
    // console.log(fileName);
    if (fileName !== imptdName) {
      if (filesToIgnore.includes(fileName)) {
        // console.log('IGNORE', fileName);
      } else {
        const ext = path.extname(fileName);
        const info = {
          id: 0, author: 0, title: '', content: '', lang: '', hash: ''
        };
        // check whether this author has this work?
        if (ext === '.epub') {
          const { options, html } = nlp.parseEbook(sourcePath);
          console.log(options);
          info.author = persons?.[options.author];
          info.title = options.title;
          info.lang = options.lang;
          info.content = html;
        } else if (!ext) {
          const [author, title] = fileName.split('=');
          console.log(author, persons[author], title);
          info.author = persons?.[author];
          info.content = fs.readFileSync(sourcePath, 'utf8');
        }
        if (info.author && info.title && info.content) {
          const hash = crypto.createHash('sha256').update(info.content).digest('hex');
          // eslint-disable-next-line no-await-in-loop
          const { id } = await db.setData({ id: 0 }, 'works', { title: info.title, authors: [info.author], hash });
          console.log(id);
          const filePath = path.join(textsDir, `${id}.html`);
          fs.writeFileSync(filePath, info.content);
        // fs.appendFileSync(imptd, `${fileName}\n`);
        }
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
      const info = await db.getData('works', { id: rest.id });
      const { hash } = info.shift();
      // console.log(info);
      const newHash = crypto.createHash('sha256').update(text).digest('hex');
      if (hash !== newHash) {
        const filePathHTML = path.join(textsDir, `${rest.id}.html`);
        fs.writeFileSync(filePathHTML, text);
        const filePathCONLL = path.join(textsDir, `${rest.id}.conll`);
        if (fs.existsSync(filePathCONLL)) {
          console.log('remove CONLL');
          fs.unlinkSync(filePathCONLL);
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
        const filePath = path.join(textsDir, `${req.query.id}.html`);
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
