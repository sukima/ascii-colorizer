const { Readable, Transform } = require('stream');
const { StringDecoder } = require('string_decoder');
const { ESCAPE_CODES } = require('./codes');

function colorFor(colorChar, previousColor) {
  let code = ESCAPE_CODES[colorChar] || ESCAPE_CODES.Z;
  return code === previousColor ? '' : code;
}

function createCharStream() {
  let decoder = new StringDecoder('utf8');
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      let chunkString = encoding === 'buffer' ? decoder.write(chunk) : chunk;
      for (let char of chunkString) {
        this.push(char);
      }
      callback();
    }
  });
}

function createColorizerStream(asciiArtStream, colorStream) {
  let asciiArtIter = asciiArtStream.pipe(createCharStream())[Symbol.asyncIterator]();
  let colorIter = colorStream.pipe(createCharStream())[Symbol.asyncIterator]();
  return new Readable({
    async read() {
      let previousColor = colorFor('');
      let asciiArtItem = await asciiArtIter.next();
      let colorItem = await colorIter.next();
      while (!asciiArtItem.done) {
        let asciiArtChar = asciiArtItem.value;
        let colorChar = colorItem.value;
        let colorCode = colorFor(colorChar, previousColor);
        this.push(colorCode + asciiArtChar);
        previousColor = colorCode === '' ? previousColor : colorCode;
        asciiArtItem = await asciiArtIter.next();
        colorItem = await colorIter.next();
      }
      this.push(colorFor('', previousColor));
      this.push(null);
    }
  });
}

module.exports = createColorizerStream;
