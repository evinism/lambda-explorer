import { assert } from 'chai';
import { resetEpsilonCounter } from '../operations';
import { toNormalForm } from '../normalize';
import { parseTerm } from '../parser';
import { purgeAstCache } from '../util';
import suiteData from './generated_suite.data.js';

/*
  Tests evaluation of expressions end to end based on previous versions.
  so like, integration tests or somethin, but just makes sure stuff doesn't unintentially change.
  Make sure to write down when suite was generated.

  assuming empty execution context (no variables to resolve)
  suiteData = [
    {text: <string>, normalForm: <ast> },
    ...
  ]

  To generate a suite, output text and normalized, don't assign anything, avoid epsilon issues, ensure depth 1000
  Later on i'll put in some nice scripts. When i'm not on a plane, i'll look up how to actually do this.
*/

describe('Generated Expression Suite', function(){
  it('is unchanged from previous versions', function(done){
    suiteData.forEach(datum => {
      assert.deepEqual(
        purgeAstCache(toNormalForm(parseTerm(datum.text), 1000)),
        datum.normalForm
      );
    });
    done();
  });
});
