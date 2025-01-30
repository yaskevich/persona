/* eslint-disable no-cond-assign */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
// import nlp from './nlp.js';

let dirent;

const dir = fs.opendirSync('../texts/');

while ((dirent = dir.readSync()) !== null) {
  if (dirent.name.includes('.html')) {
    const fpath = path.join(dirent.parentPath, dirent.name);
    const content = fs.readFileSync(fpath, 'utf8');
    // console.log(content);
    console.log(fpath);
    const newContent = content
      .replaceAll('<p>&nbsp;</p>', '')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('  ', ' ');
    fs.writeFileSync(fpath, newContent);

    // const iss = (content.replace(/<[^>]*>?/gm, ' ').match(/i/ig) || []).length;
  }
}

dir.closeSync();

// console.log(works);
process.exit();
