import { LambdaToken } from './types';

function tokenize(str: string) : LambdaToken[] {
  let tokenStream : LambdaToken[] = [];
  for(let pos = 0; pos < str.length; pos++){
    const nextChar = str.slice(pos, pos + 1);
    if (/\s/.test(nextChar)){ // skip whitespace.
      continue;
    } if (nextChar === 'λ') {
      tokenStream.push({
        type: 'lambda'
      });
    } else if(nextChar === '.') {
      tokenStream.push({
        type: 'dot',
      });
    } else if(nextChar === '(') {
      tokenStream.push({
        type: 'openParen',
      });
    } else if(nextChar === ')') {
      tokenStream.push({
        type: 'closeParen',
      });
    } else if(/[a-zε]/.test(nextChar)){
      // scan ahead to read the whole identifier
      let name = nextChar;
      while(/[₀-₉]/.test(str[pos + 1])){
        pos++;
        name += str[pos];
      }
      tokenStream.push({
        type: 'identifier',
        value: name,
      });
    } else if(/[A-Z]/.test(nextChar)) {
      let name = nextChar;
      while(/[A-Z]/.test(str[pos + 1])) {
        pos++;
        name += str[pos];
      }
      while(/[₀-₉]/.test(str[pos + 1])){
        pos++;
        name += str[pos];
      }
      tokenStream.push({
        type: 'identifier',
        value: name,
      });
    } else if(nextChar === ':'){
      pos++;
      if (str[pos] !== '=') {
        throw { message: 'Lexing Error: \'=\' expected after :' };
      }
      tokenStream.push({
        type: 'assignment',
      });
    } else {
      // TODO: associate every token with a padding, so we can get better syntax errors in the parsing stage.
      const excerptPadding = 5;
      const lower = Math.max(pos - excerptPadding, 0);
      const upper = Math.min(pos + excerptPadding, str.length);
      const excerpt = str.slice(lower, upper);
      throw { message: `Lexing Error: unexpected character at ${pos}: ${excerpt}` };
    }
  }
  return tokenStream;
}

export { tokenize };
