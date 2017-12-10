import { assert } from 'chai';
import { cacheOnAst, purgeAstCache } from '../util';

describe('Caching Util', function(){
  it('creates cache keys on ASTs', function(done){
    const ast = {};
    const compute = cacheOnAst(ast => 'value');
    compute(ast);
    const keys = Object.keys(ast);
    assert(keys.length === 1);
    assert(keys[0].slice(0, 9) === '__cache__');
    done();
  });

  it('makes cached functions not recompute', function(done){
    let computeCount = 0;
    const compute = cacheOnAst((ast) => {
      computeCount++;
      return 'value!';
    });
    const ast = {};
    const value1 = compute(ast);
    const value2 = compute(ast);
    assert(computeCount === 1);
    assert(value1 === value2);
    done();
  });

  it('shallow removes caches on the AST', function(done){
    const compute = cacheOnAst((ast) => 'value!');
    const source = {};
    compute(source);
    assert.deepEqual(purgeAstCache(source), {});
    done();
  });

  it('deep removes caches on the AST', function(done){
    const compute = cacheOnAst((ast) => 'value!');
    const source = { subkey: {} };
    compute(source.subkey);
    const expected = { subkey: {} };
    assert.deepEqual(purgeAstCache(source), expected);
    done();
  });
});
