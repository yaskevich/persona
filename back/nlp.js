export default {
  //   convertToConll(corpus) {
  //     console.log(corpus);
  //   },
  // .replace(/<[^>]*>?/gm, '');

  async udpipe(content, langID) {
    const body = new FormData();
    body.set('tokenizer', '');
    body.set('tagger', '');
    body.set('parser', '');
    body.set('model', langID);
    body.set('data', content.replace(/<[^>]*>?/gm, ''));

    const response = await fetch('https://lindat.mff.cuni.cz/services/udpipe/api/process', { method: 'POST', body });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let sn = 0;
    const json = await response.json();
    const sentPattern = '# sent_id = ';

    const parseFeatures = (x) => Object.fromEntries(x.split('|').map((z) => z.split('=')));

    return json.result.split('\n').map((x) => {
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
