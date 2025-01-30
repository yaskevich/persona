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
    const iss = (content.replace(/<[^>]*>?/gm, ' ').match(/i/ig) || []).length;
    if (iss > 100) {
    //   console.log(dirent.name);
    //   console.log(iss);

      const newContent = content.replaceAll('div', '😜')
        .replaceAll('id', '🤪')
        .replaceAll('i', 'і')
        .replaceAll('I', 'І')
        .replaceAll('😜', 'div')
        .replaceAll('🤪', 'id')
        .replaceAll('<p>І</p>', '<p>І</p>')
        .replaceAll('<p>ІІ</p>', '<p>ІI</p>')
        .replaceAll('<p>ІІІ</p>', '<p>ІII</p>')
        .replaceAll('<p>ІV</p>', '<p>ІV</p>')
        .replaceAll('<p>VІ</p>', '<p>VІ</p>')
        .replaceAll('<p>VІІ</p>', '<p>VІІ</p>')
        .replaceAll('<p>VІІІ</p>', '<p>VІІI</p>')
        .replaceAll('<p>ІX</p>', '<p>ІX</p>')
        .replaceAll('<h3>І</h3>', '<h3>І</h3>')
        .replaceAll('<h3>ІІ</h3>', '<h3>ІI</h3>')
        .replaceAll('<h3>ІІІ</h3>', '<h3>ІII</h3>')
        .replaceAll('<h3>ІV</h3>', '<h3>ІV</h3>')
        .replaceAll('<h3>VІ</h3>', '<h3>VІ</h3>')
        .replaceAll('<h3>VІІ</h3>', '<h3>VІІ</h3>')
        .replaceAll('<h3>VІІІ</h3>', '<h3>VІІI</h3>')
        .replaceAll('<h3>ІX</h3>', '<h3>ІX</h3>');
      fs.writeFileSync(fpath, newContent);
    } else if (iss > 10) {
      console.log(iss, fpath);
    }
  }
}

dir.closeSync();

// console.log(works);
process.exit();
