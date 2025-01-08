import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import db from './db.js';
import nlp from './nlp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const textsDir = path.join(__dirname, 'texts');
const filesDir = path.join(__dirname, 'files');
const imptdName = '.imported';
const __package = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const initDirs = () => fs.mkdirSync(textsDir, { recursive: true })
&& fs.mkdirSync(filesDir, { recursive: true });

const getText = (id) => {
  if (id) {
    try {
      const filePath = path.join(textsDir, `${id}.html`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return content;
      }
    } catch (err) {
      console.error(err);
    }
  }
  return '';
};

const storeText = async (id, text) => {
  if (text && id) {
    const info = await db.getData('works', { id });
    const { hash } = info.shift();
    // console.log(info);
    const newHash = crypto.createHash('sha256').update(text).digest('hex');
    if (hash !== newHash) {
      const filePathHTML = path.join(textsDir, `${id}.html`);
      fs.writeFileSync(filePathHTML, text);
      const filePathCONLL = path.join(textsDir, `${id}.conll`);
      if (fs.existsSync(filePathCONLL)) {
        console.log('remove CONLL');
        fs.unlinkSync(filePathCONLL);
      }
      return db.setHash(newHash, id);
    }
  }
  return {};
};

const textToConll = async (user, props, authorship) => {
  const {
    hash, id, title, yeardate, lang,
  } = props;
  let result = 0;
  if (hash) {
    const filePath = path.join(textsDir, `${id}.html`);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(new Date().toUTCString(), 'sent to API');
    let conll = await nlp.udpipe(content, lang);
    console.log(new Date().toUTCString(), 'conll received');
    conll = nlp.addHeader(conll, id, hash, authorship, title, yeardate);
    fs.writeFileSync(`${filePath}.conll`, conll);
    console.log(new Date().toUTCString(), 'written');
    const parsed = nlp.conllToArray(conll);
    result = await db.saveCorpus(user, id, parsed);
    console.log(new Date().toUTCString(), 'saved');
  }
  return result;
};

const annotateWorks = async (user, params) => {
  const ppl = Object.fromEntries((await db.getData('persons')).map((x) => [x.id, [`${x.rendername ? x.rendername : `${x.firstname} ${x.lastname}`}`, x.sex]]));
  const data = await db.getData('works', params);
  const results = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const props of data) {
    const au = props.authors.map((x) => `${ppl[x][0]} [${['n', 'm', 'f'][ppl[x][1]]}]`).join('; ');
    // eslint-disable-next-line no-await-in-loop
    results.push(await textToConll(user, props, au));
  }

  return results;
};

const analyze = async (user, params) => String((await annotateWorks(user, params))?.shift());

const importFiles = async () => {
  const imptd = path.join(filesDir, imptdName);
  const settings = await db.getData('settings', { id: 1 });
  const defaultLanguage = settings.shift().lang;
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
        // console.log('ext', ext);
        // check whether this author has this work?
        if (ext === '.epub') {
          const buf = fs.readFileSync(sourcePath);
          const { options, html } = nlp.parseEbook(buf);
          // console.log(options);
          info.author = persons?.[options.author];
          info.title = options.title;
          info.lang = options.lang;
          info.content = html;
        } else if (ext === '.fb2') {
          const buf = fs.readFileSync(sourcePath);
          const { options, html } = nlp.parseFb2(buf);
          // console.log(options);
          // console.log(persons);
          info.author = persons?.[options.author];
          info.title = options.title;
          info.content = html;
        } else if (!ext) {
          const [author, title] = fileName.split('=');
          console.log(author, persons[author], title);
          info.author = persons?.[author];
          info.content = fs.readFileSync(sourcePath, 'utf8');
        } else {
          console.log('ERROR', fileName);
        }
        if (info.author && info.title && info.content) {
          const hash = crypto.createHash('sha256').update(info.content).digest('hex');
          // eslint-disable-next-line no-await-in-loop
          const { id } = await db.setData({ id: 0 }, 'works', {
            title: info.title, authors: [info.author], hash, lang: info.lang || defaultLanguage
          });
          // console.log(id);
          const filePath = path.join(textsDir, `${id}.html`);
          fs.writeFileSync(filePath, info.content);
          fs.appendFileSync(imptd, `${fileName}\n`);
        } else {
          console.error(info.author, info.title, fileName);
        }
      }
    }
  }
};

export default {
  initDirs,
  importFiles,
  getText,
  storeText,
  textToConll,
  annotateWorks,
  analyze,
  version: __package.version,
};
