/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import db from '../db.js';

// import nlp from './nlp.js';
// import db from './db.js';

let dirent;
const dir = fs.opendirSync('./texts');

const works = await db.getData('works');
const ids = works.filter((x) => !x.yeardate).map((x) => x.id);

// eslint-disable-next-line no-cond-assign
while ((dirent = dir.readSync()) !== null) {
  const id = Number(dirent.name.split('.').shift());
  // console.log(id, ids);
  if (dirent.name.includes('.html') && ids.includes(id)) {
    const filepath = path.join(dirent.parentPath, dirent.name);
    const content = fs.readFileSync(filepath, 'utf8').slice(-100);
    const regexp = /(\d{4})/g;

    const array = [...content.matchAll(regexp)];

    if (array?.length) {
      // console.log(filepath);
      // console.log(content);

      // console.log(array);
      const dates = array.map((x) => Number(x[1]));
      if (dates?.length === 1) {
        const yeardate = dates.shift();
        console.log('OK', id, yeardate);
        // await db.setData({ id: 0 }, 'works', { id, yeardate, });
      } else {
        const mx = Math.max(...dates);

        if (mx < 1930) {
          console.log('1930!');
          await db.setData({ id: 0 }, 'works', { id, yeardate: mx, });
        } else {
          const mn = Math.min(...dates);
          console.log('??', id, mn, dates);
          await db.setData({ id: 0 }, 'works', { id, yeardate: mn, });
        }
      }
    }
  }
}

dir.closeSync();

// console.log(works);
process.exit();
