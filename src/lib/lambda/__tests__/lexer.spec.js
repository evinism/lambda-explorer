import { assert } from 'chai';
import { tokenize } from '../lexer';

describe('Lexer', function(){
  it('should correctly lex all valid token types', function(done){
    const source = 'B := (λa₃.a₃)';
    const expected = [
      {type: "identifier", value: "B"},
      {type: "assignment"},
      {type: "openParen"},
      {type: "lambda"},
      {type: "identifier", value: "a₃"},
      {type: "dot"},
      {type: "identifier", value: "a₃"},
      {type: "closeParen"}
    ];
    const tokenized = tokenize(source);
    assert.deepEqual(tokenized, expected);
    done();
  })
})
