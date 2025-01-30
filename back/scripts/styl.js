/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import unidecode from 'unidecode';
import db from './db.js';

const dp = './corpus';
fs.rmSync(dp, { recursive: true, force: true });
fs.mkdirSync(dp, { recursive: true });

// import nlp from './nlp.js';
// import db from './db.js';

const cap = (words) => words.split(' ').map((w) => w.substring(0, 1).toUpperCase() + w.substring(1)).join(' ');

const works = await db.getData('works');
const persons = await db.getData('persons');
// console.log(persons);
// process.exit();
// eslint-disable-next-line no-restricted-syntax
for (const work of works) {
  const person = persons.find((x) => x.id === work.authors[0]);
  const name = person.rendername ? person.rendername : `${person.firstname} ${person.lastname}`;
  const title = (`${name.split(' ')?.[1]?.length > 3 ? name.split(' ')[1] : name.split(' ')[0]}_${work.id}${cap(work.title.slice(0, 6))}${work.yeardate || '0'}`);
  const filename = unidecode(title).replace(/[.,/#?!'$%^&*;:{}=\-`~()]/g, '').replaceAll(' ', '').replaceAll('<', '')
    .replaceAll('>', '')
    .replaceAll('Ia', 'Ja');
  console.log(filename);

  const fpath = path.join('./texts', `${work.id}.html`);
  const content = fs.readFileSync(fpath, 'utf8');
  const data = `${work.title}\n\n${content.replace(/(?<=<\/h\d>)/gm, '\n\n').replace(/<[^>]*>?/gm, ' ').replaceAll("'", '’')}`;
  fs.writeFileSync(path.join('./corpus', `${filename}.txt`), data);
}

// eslint-disable-next-li// console.log(works);
process.exit();
