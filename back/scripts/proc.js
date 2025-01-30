/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
// import nlp from './nlp.js';
import { diffWords, diffChars } from 'diff';
import colors from 'colors';
import db from '../db.js';

// import unidecode  from 'unidecode';
// // fs.writeFileSync('test.html', html);
// const res = unidecode("Больш за ўсіх. Прывітанне, як здароўе?")
// .replaceAll('\'', '').replace(/[^\p{L}\p{N}]/gu, ' ').trim().replace(/\s+/g, '-').toLowerCase();
// console.log(res);

// const data = nlp.parseEbook('./books/Treski_na_chvalach.epub');
// console.log(data.options);

// const data = nlp.parseFb2('./files/drygva-322688.fb2');
// console.log(data);

// import locale from 'locale-codes';

// locale.all
// console.log(locale.getByISO6392('eng'));
// console.log(locale.where('tag', 'pt-br'));
// console.log(locale.all);

const works = await db.getData('works');
const persons = await db.getData('persons');
const persons1 = Object.fromEntries((persons).map((x) => [`${x.firstname} ${x.lastname}`, x.id]));
const persons2 = Object.fromEntries((persons).map((x) => [`${x.rendername ? x.rendername : `${x.firstname} ${x.lastname}`}`, x.id]));

const dir = fs.opendirSync('/home/ya/github/bel-lang/backed-local/');
let dirent;
// 'Залаты прамень адрозніваецца ад варыянта Палічки'
const good = ['b72cbcdf6217b20efdc296cdbe0db6073c8cc48ac9d190159db99cb82b5d2751',
  '36fb19c19a4d30611d5c55fab7aa6aeb72a79e0c0b1219549d8f35e3a1a36f778b83e13592c9c191c74e8525edf510fa54106cd80755d2709008e34c38e2c5f0',
  '0112748e2ceb869e21c680d629c8e00e46ad4fac869bfad7c0cfea0d22c58435',
  '4fbc59f3763800e4144b739827e1dd9ed8b3bd02e20c8943833d1fe368ded064',
  'a1f8ac16fde0d7eed577888f1a4475a110b40697bf4e5e8b3f77306e4773bb49',
  '7dff21637396c923267180bd726e06f82ddc72754b7dca0205283cd7bcf6564a',
  '6a6e801dd1dd76df48e39b3f526751f45cb489a178c0fd592d62687eb60c6622',
  '1debafa7bd64ec35ca7fd7a1c92d6adedc089a205e92b7aab1b03dc4612b64d3',
  'b304e2f888a89b13fbfd508995971a781da0504de1e1047e8ce95bc99a32e9cf',
  'bfc7daab5c2fe259a1cf6b192cf7464902581ad5bee809bd195b6bbcd39330fb',
  '1fdaa3b2f5a090c6d55f1bce3f8eefe4a41013fcfefc05d448cb3762110117c7',
  'dd12cf85a81729465169526ed5aa92106995ee490d98d106aa5e22d94d86da5d',
  'c0e2ccbd2c7916b9f622386506afd707d5f64e136716dfd177245afd3e1199ac',
  'b562f3fc2a71b82ae8ed17e52aaa74c7af38d04cb5b155c5d597925ad0db272b',
  '15d159ce49b697711bfe1be4fc8f8633365889c43dcd9106b20532086f27fcdb',
  '6a3d6adf530ccf83cbe865da31a99cac9a876dbcbac28840b040111f4cf12547',
  '0051abb3eec920cc71c5ba8cb882bfb897bea297906b068041a255876759b6c8',
  '7ae2125ba1836d4ea43c4194fe328480ba8349f2c9f7f65de09e75e83b05d616',
  'e02268cadb0cad896ac094afe18a64661f030a2f9e8c1c088b1f4a24f8488773',
  'a9cbac804224996fefe09c70068b286c34d85a9e13b874c53ace4ba085eebbb4',
  'f9c97ecac0c0ed4289e5c1bb6ce37bace33f49c19fa951c59b2fcf3105ca7275',
  '185aff9e76741d7be75be57794da751cc934505c035909fb68fa4a059a45fae9',
  'd24aebdd9f19e596bcd7ede5abe5572b49fc61fad80849beab8d4d27889347e3',
  '73bbf45ceb82dede8ffb6a0c1902186f3ed318ccb3c3bbd989843af2610b80f5',
  '1ea2ded7e9de54ad7f9202bdf4005efe005d8cfa30bb3941b3b79eeb6e94a9fa',
  '5c85844a83351f0ad228fa56b095f3050076332bd13a304f3f2770088b657ca0',
  'bc91249818550235705e8a9f0f8fe26e84b9ce05cbdb8d5bf9b0a10be8777028',
  '2501489a5352a1305465855afde7bbe921972b6ce46eec34243e738c764b8181',
  'd05ebdad4b1064a2db21e6fa747c7c929753c2e3198bd00a541f0b212a4f264d',
  'b452b4752af0ec0f1bf436968d08c5f2ec2fead97fb66b8fe9e8fd0a9518d1c8',
  'ea7f55a1bb618d4cd0ac56e3d193742cda8b8dc22a32f4bf6a6520459951a643'
];

const bad = [
  '0f16beea46f7adc523f353810b6724371ad0ce0d9f7db11128c944707dc04858',
  'd19157731636cc5f569613adabe5ebda3ddb8a91c49e9798723d2e443176a7fe',
  '1a5b55f9e5fb515f068d48de0ac91064d4cfe8b0627b0f68ed8232d4e15cee57',
  'a8727da74790e69bc3ed643452640331dce1b55dbb2059433a20904e6027ebcc',
  '268e2f820bc1b9e2197ccb2c8d2e27306e4ef2574b2dee4adde038868e2acbbe',
  '65747da8b7c795a69f36239b5d0a41f390ede14d0fb9b74774654ed4ca09f103',
  '549d8f35e3a1a36f778b83e13592c9c191c74e8525edf510fa54106cd80755d2',
  '36fb19c19a4d30611d5c55fab7aa6aeb72a79e0c0b1219709008e34c38e2c5f0',
  '92768567dfc0e9abd96877ae1d063a625326d05cb72c1c66304533cf286a6bd5',
  'f91ca93565682df1152df86066e65f9646afb226f0b5586e05237da7fcab2a58',
  '4a80dceac85a3010e3212a07a54990a1d906fb93eb87b7de478042708074b6f3',
  'a075201e5b85907e7cd76792cdb36d45b9aeb25fe7918608161bb511bfc6e087',
  '2233a05c40bc125b8646a381cf2b9ad3c9dc5e090d4d4341514425085f96ac74',
  '879869d74bb3ce6058ecac23a2121ad114e23465e4f357b6cc974b508ea8c155'
];

// eslint-disable-next-line no-cond-assign
while ((dirent = dir.readSync()) !== null) {
  if (dirent.name.includes('.conll')) {
    const content = fs.readFileSync(path.join(dirent.parentPath, dirent.name), 'utf8');
    const info = content.split('# ').slice(1, 14);
    // console.log(info);

    const hash = info[1].split(' = ')[1].slice(0, -1);
    const title = info[3].split(' = ')[1].slice(0, -1).replaceAll('i', 'і').replaceAll('I', 'І');
    const year = info[5].split(' = ')[1].slice(0, -1);
    const authors = info[2].split(' = ')[1].split(' ');
    const name = `${authors[1]} ${authors[0].slice(0, -1)}`;
    const person = persons1?.[name] || persons2?.[name];

    const corresp = works.filter((x) => x.title.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') === title.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ''));

    if (corresp.length) {
      if (corresp > 1) {
        console.log('multiple files', title);
        process.exit();
      } else if (hash !== corresp[0].hash) {
        const { id } = corresp.shift();
        const dbPath = path.join('./', 'texts', `${id}.html`);
        const patchPath = path.join(dirent.parentPath, hash);

        const patchFile = fs.readFileSync(patchPath, 'utf8').replaceAll(' - ', ' — ').replaceAll("'", 'ʼ').replaceAll('>-', '>—');

        if (good.includes(hash)) {
          // copy and set
          console.log(title);
          fs.copyFileSync(
            path.join('./', 'texts', `${id}.html`),
            path.join(dirent.parentPath, `${hash}.db`)
          );

          fs.writeFileSync(path.join('./', 'texts', `${id}.html`), patchFile);

          await db.setData({ id: 0 }, 'works', {
            id,
            title,
            authors: [person],
            hash,
            yeardate: year,
            lang: 'bel'
          });
          // eslint-disable-next-line no-continue
          continue;
        } else if (bad.includes(hash)) {
          await db.setData({ id: 0 }, 'works', {
            id,
            title,
            authors: [person],
            yeardate: year,
            lang: 'bel'
          });
          // eslint-disable-next-line no-continue
          continue;
        }
        console.log('db:', id);
        const dbFile = fs.readFileSync(dbPath, 'utf8').replaceAll(' - ', ' — ').replaceAll("'", 'ʼ').replaceAll('>-', '>—');

        console.log(dbPath);
        console.log(hash);

        console.log('DB', (dbFile.match(/i/ig) || []).length, '->', 'CONLL', (patchFile.match(/i/ig) || []).length);

        // const delta = diffWords(oldFile, newFile).filter((x) => x.added || x.removed);
        // console.log(delta);
        const diff = diffChars(dbFile, patchFile);

        diff.forEach((part) => {
          // green for additions, red for deletions
          // eslint-disable-next-line no-nested-ternary
          const text = part.added ? part.value.bgGreen
            : part.removed ? part.value.bgRed
              : part.value;
          process.stderr.write(text);
        });
        // when replace store old DB variant
        // process.exit();
      }
    } else {
      console.log('not in db');
      // eslint-disable-next-line no-await-in-loop
      const { id } = await db.setData({ id: 0 }, 'works', {
        title, authors: [person], hash, lang: 'bel', yeardate: year,
      });
      fs.copyFileSync(
        path.join(dirent.parentPath, hash),
        path.join('./', 'texts', `${id}.html`),
        fs.constants.COPYFILE_EXCL
      );
      console.log(year, `|${title}|`, person);
      console.log(hash);
      console.log('SET', id);
      console.log('=================================');
    }
    // break;
  }
}
dir.closeSync();

// console.log(works);
process.exit();

// const pth = '/home/ya/github/persona/back/texts/0c2813c8f163846346f7930fe06f793d647fb62383b2ad8c8474ea56d430ef29.conll';

// const conll = fs.readFileSync(pth, 'utf8');
// const cols = Object.fromEntries(conll
//   .slice(0, 5000)
//   .split('# ')
//   .map((x) => x.trim())
//   .map((x) => x.split('=').map((y) => y.trim()))
//   .slice(1));

// const {
//   text_id: tid, hash, authors, title, origyear
// } = cols;
// const au = authors.split('[').shift().split(',').map((x) => x.trim());
// let writer = `${au[1]} ${au[0]}`;

// const maps = {
//   'Антон Лявіцкі': 'Ядвігін Ш.'
// };

// if (maps?.[writer]) {
//   writer = maps[writer];
// }

// const persons = Object.fromEntries((await db.getData('persons')).map((x) => [`${x.rendername ? x.rendername : `${x.firstname} ${x.lastname}`}`, x.id]));

// console.log(tid, hash, writer, title, origyear);

// process.exit();
// console.log(persons);
// console.log('done');

// get writer id

// create work
// set title hash, writer and year

// const data = JSON.parse(fs.readFileSync('/home/ya/backup/rest/data.json', 'utf8'));
// for (const cid of Object.keys(data)) {
//   console.log(cid);
//   await pool.query("update comments set published = TRUE where id = $1", [cid]);
// }
