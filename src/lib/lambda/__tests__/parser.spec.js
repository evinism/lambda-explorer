import { assert } from 'chai';
import { parseExpression, parseStatement } from '../parser.ts';

describe('Parser', function(){
  it('correctly parses an expression', function(done){
    done();
  });

  it('is right associative under application', function(done){
    const tokenStream = [
      {type: "identifier", value: "a"},
      {type: "identifier", value: "b"},
      {type: "identifier", value: "c"},
      {type: "identifier", value: "d"},
    ];
    const expected = ({
      type: 'application',
      left: { type: 'variable', name: 'a' },
      right: {
        type: 'application',
        left: { type: 'variable', name: 'b' },
        right: {
          type: 'application',
          left: { type: 'variable', name: 'c' },
          right:{ type: 'variable', name: 'd' },
        }
      }
    });
    assert.deepEqual(parseExpression(tokenStream), expected);
    done();
  })
});
