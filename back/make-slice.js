/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import db from './db.js';

const dp = './data/corpus2';
fs.rmSync(dp, { recursive: true, force: true });
fs.mkdirSync(dp, { recursive: true });

// import nlp from './nlp.js';
// import db from './db.js';

const works = await db.getData('works');

// eslint-disable-next-line no-restricted-syntax
for (const work of works) {
// 1, 2, 7
  if ([1, 2, 7].includes(work.genre) && (!work.yeardate || work.yeardate < 1950)) {
    // console.log(work);
    const fpath = path.join('./texts', `${work.id}.conll`);
    if (fs.existsSync(fpath)) {
      fs.copyFileSync(
        fpath,
        path.join('./data/corpus2', `${work.id}.conll`)
      );
    } else {
      console.log('error', work.id);
    }
  }
}

process.exit();
