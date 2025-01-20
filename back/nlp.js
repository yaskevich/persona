import { unzipSync } from 'fflate';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import chardet from 'chardet';
import iconv from 'iconv-lite';
// import jschardet from 'jschardet';

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
  trimValues: true,
  parseAttributeValue: true,
  processEntities: false,
  preserveOrder: true,
  // htmlEntities: true
};

const getNodeByName = (arr, name) => arr.find((x) => name in x)?.[name];

export default {
  addHeader(text, id, hash, authorship, title, year, lang) {
    return `# text_id = ${id}
    # hash = ${hash}
    # authors = ${authorship}
    # title = ${title}
    # lang = ${lang}
    # origyear = ${year}
    # lang_var = be-BY
    ${text}`;
  },
  parseFb2(buf) {
    let encoding = '';

    if (buf.toString('utf8', 0, 30) === '<?xml version="1.0" encoding="') {
      const match = buf.toString('utf8', 30, 100).split('"').shift();
      if (iconv.encodingExists(match)) {
        encoding = match;
      } else {
        console.log('inknown encoding');
      }
    }

    if (!encoding) {
      encoding = chardet.detect(buf);
    }

    const text = iconv.decode(buf, encoding);
    const parser = new XMLParser(options);
    // parser.addEntity('nbsp', ' ');
    // parser.addEntity('apos', '’');
    // parser.addEntity('quot', '"');
    const builder = new XMLBuilder(options);
    const jObj = parser.parse(text);
    // console.log(JSON.stringify(jObj));
    const nodeF = getNodeByName(jObj, 'FictionBook');
    const nodeB = getNodeByName(nodeF, 'body');
    const nodeC = getNodeByName(nodeB, 'section');
    const author = Object.values(nodeC.shift()).shift().shift().text.trim();
    const title = Object.values(nodeC.shift()).shift().shift().text.trim();
    return { options: { author, title }, html: builder.build(nodeC) };
    // return JSON.stringify(jObj.FictionBook.body.section);
  },
  parseEbook(buf) {
    try {
      const unzipped = unzipSync(buf);
      const q = ':@';
      // console.log(unzipped);
      // const content = Object.keys(unzipped)
      //   .filter((filename) => unzipped[filename].length > 0)
      //   .map((filename) => new File([unzipped[filename]], filename));
      // console.log(content);
      const meta = Buffer.from(unzipped['content.opf']).toString();
      const parser = new XMLParser(options);
      // parser.addEntity('nbsp', ' ');
      // parser.addEntity('apos', '’');
      // parser.addEntity('quot', '"');
      const builder = new XMLBuilder(options);
      const jObj = parser.parse(meta);
      // console.log(JSON.stringify(jObj));
      const nodeP = getNodeByName(jObj, 'package');
      const nodeD = getNodeByName(nodeP, 'metadata');
      const nodeM = getNodeByName(nodeP, 'manifest');
      const title = getNodeByName(getNodeByName(nodeD, 'dc:title'), 'text');
      const lang = getNodeByName(getNodeByName(nodeD, 'dc:language'), 'text');
      const author = getNodeByName(getNodeByName(nodeD, 'dc:creator'), 'text');

      const getData = (chunk) => {
        const obj = parser.parse(chunk.toString())[1].html[1].body;
        return obj.map((x) => (x?.div && x[q]?.class === 'POETRY' ? { blockquote: x.div, [q]: { class: 'poetry' } } : x));
      };

      const html = nodeM.filter((x) => x?.[':@']?.['media-type'] === 'application/xhtml+xml').map((x) => builder.build(getData(Buffer.from(unzipped[x?.[q]?.href])))).join('').replaceAll('<p> </p>', '')
        .replaceAll('<div class="CLEAR"></div>', '')
        .replaceAll('  ', ' ');
      // console.log(html);
      return {
        options: {
          title, lang, author
        },
        html
      };
    } catch (error) {
      console.log('[ZIP]', error);
      return {};
    }
  },
  async udpipe(content, title, langID) {
    const body = new FormData();
    body.set('tokenizer', '');
    body.set('tagger', '');
    body.set('parser', '');
    body.set('model', langID);
    body.set('data', `${title}\n\n${content.replace(/(?<=<\/h\d>)/gm, '\n\n').replace(/<[^>]*>?/gm, ' ').replaceAll("'", '’')}`);

    const response = await fetch('https://lindat.mff.cuni.cz/services/udpipe/api/process', { method: 'POST', body });

    if (response.ok) {
      const json = await response.json();
      return json.result;
    }

    console.log(`Response status: ${response.status}`);
    // throw new Error(`Response status: ${response.status}`);
    return '';
  },

  conllToArray(data) {
    const parseFeatures = (x) => Object.fromEntries(x.split('|').map((z) => z.split('=')));

    let sn = 0;
    const sentPattern = '# sent_id = ';

    return data.split('\n').map((x) => {
      if (x.charAt(0) === '#') {
        if (x.includes(sentPattern)) {
          sn = Number(x.replace(sentPattern, ''));
        }
        return null;
      }

      const props = x.split('\t');
      if (props?.length === 10) {
        const names = ['tid', 'form', 'lemma', 'upos', 'xpos', 'feats', 'head', 'deprel', 'deps', 'misc'];
        const obj = { sid: sn };
        props.forEach((y, i) => {
          if (y !== '_') {
            if (i === 5 || i === 9) {
              obj[names[i]] = parseFeatures(y);
            } else if (i === 0 || i === 6) {
              obj[names[i]] = Number(y);
            } else {
              obj[names[i]] = y;
            }
          }
        });
        return obj;
      }
      return null;
    }).filter((x) => x);
  }
};
