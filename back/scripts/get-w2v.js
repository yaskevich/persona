/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import path from 'path';
import db from '../db.js';

const result = await db.getLemmasForVectors();

// const text = result.map((x) => `${x.lemma}\t${x.freq}\t${x.qty}`).join('\n');
// fs.writeFileSync('propn.txt', text);

let wid = 1;
let sid = 1;
let arr = [];
let text = '';

for (const item of result) {
  if (item.wid !== wid || item.sid !== sid) {
    wid = item.wid;
    sid = item.sid;
    text += `${arr.join(' ')}\n\n`;
    arr = [];
  }
  arr.push(item.lemma);
}

fs.writeFileSync(path.join('w2v.txt'), text);

process.exit();
