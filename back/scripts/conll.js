// import fs from 'fs';
// import path from 'path';
import ops from '../ops.js';
// import db from './db.js';

await ops.annotateWorks({ id: 0 }, {});

// const works = await db.getData('works');

// for (const item of works) {
//   const filePath = path.join('./texts', `${item.id}.html`);
//   console.log(item.id, filePath, item.lang);
// }
process.exit();
