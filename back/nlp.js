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
  processEntities: true,
};

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
    parser.addEntity('nbsp', ' ');
    parser.addEntity('apos', '’');
    const builder = new XMLBuilder(options);
    const jObj = parser.parse(text);
    console.log(JSON.stringify(jObj));
    const author = jObj.FictionBook.body.section.p.shift().trim();
    const title = jObj.FictionBook.body.section.p.shift().trim();
    return { options: { author, title }, html: builder.build(jObj.FictionBook.body.section) };
    // return JSON.stringify(jObj.FictionBook.body.section);
  },
  parseEbook(filePath) {
    const buf = fs.readFileSync(filePath);
    const unzipped = unzipSync(buf);
    // console.log(unzipped);
    // const content = Object.keys(unzipped)
    //   .filter((filename) => unzipped[filename].length > 0)
    //   .map((filename) => new File([unzipped[filename]], filename));
    // console.log(content);
    const meta = Buffer.from(unzipped['content.opf']).toString();
    const parser = new XMLParser(options);
    parser.addEntity('nbsp', ' ');
    parser.addEntity('apos', '’');
    const builder = new XMLBuilder(options);
    const jObj = parser.parse(meta);
    // console.log(jObj);
    const { 'dc:title': title, 'dc:language': lang, 'dc:creator': creator } = jObj.package.metadata;
    const html = jObj.package.manifest.item.filter((x) => x?.attrs?.['media-type'] === 'application/xhtml+xml').map((x) => builder.build(parser.parse(Buffer.from(unzipped[x.attrs.href]).toString()).html.body)).join('').replaceAll('<p> </p>', '');
    return {
      options: {
        title, lang, author: creator.text
      },
      html
    };
  },
  async udpipe(content, langID) {
    const body = new FormData();
    body.set('tokenizer', '');
    body.set('tagger', '');
    body.set('parser', '');
    body.set('model', langID);
    body.set('data', content.replace(/<[^>]*>?/gm, ' ').replaceAll("'", '’'));

    const response = await fetch('https://lindat.mff.cuni.cz/services/udpipe/api/process', { method: 'POST', body });

    if (!response.ok) {
      console.log(response.status);
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json.result;
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
