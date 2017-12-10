import { assert } from 'chai';
import { parseExpression, parseStatement } from '../parser';

describe('Parser', function(){
  it('correctly parses a lambda expression', function(done){
    const tokenStream = [
      { type: 'lambda' },
      { type: 'identifier', value: 'a' },
      { type: 'dot' },
      { type: 'identifier', value: 'b' },
    ];
    const expected = ({
      type: 'function',
      argument: 'a',
      body: { type: 'variable', name: 'b' },
    });
    assert.deepEqual(parseExpression(tokenStream), expected);
    done();
  });

  it('correctly parses an assignment statement', function(){
    const tokenStream = [
      {type: "identifier", value: "B"},
      {type: "assignment"},
      {type: "identifier", value: "C"},
    ];
    const expected = ({
      type: 'assignment',
      lhs: 'B',
      rhs: { type: 'variable', name: 'C' },
    });
    assert.deepEqual(parseStatement(tokenStream), expected);
  });

  it('is left associative under application', function(done){
    const tokenStream = [
      {type: "identifier", value: "a"},
      {type: "identifier", value: "b"},
      {type: "identifier", value: "c"},
      {type: "identifier", value: "d"},
    ];
    const expected = ({
      type: 'application',
      left: {
        type: 'application',
        left: {
          type: 'application',
          left: { type: 'variable', name: 'a' },
          right:{ type: 'variable', name: 'b' },
        },
        right: { type: 'variable', name: 'c' },
      },
      right: { type: 'variable', name: 'd' },
    });
    assert.deepEqual(parseExpression(tokenStream), expected);
    done();
  });

  it('accepts multi-argument function syntax', function(done){
    const tokenStream = [
      { type: 'lambda' },
      { type: 'identifier', value: 'a' },
      { type: 'identifier', value: 'b' },
      { type: 'identifier', value: 'c' },
      { type: 'dot' },
      { type: 'identifier', value: 'd' },
    ];
    const expected = ({
      type: 'function',
      argument: 'a',
      body: {
        type: 'function',
        argument:'b',
        body: {
          type: 'function',
          argument:'c',
          body: {
            type: 'variable',
            name: 'd',
          },
        },
      },
    });
    assert.deepEqual(parseExpression(tokenStream), expected)
    done();
  });
});
