import { assert } from 'chai';
import { bReduce, resetEpsilonCounter } from '../operations';
import { purgeAstCache } from '../util';

describe('Beta Reductions', function(){
  it('Beta reduces a redex', function(){
    const ast = {"type":"application","left":{"type":"function","argument":"a","body":{"type":"variable","name":"a"}},"right":{"type":"variable","name":"b"}}
    const expected = {"type":"variable","name":"b"};
  });

  it('Avoids name conflicts when executing beta reductions', function(){
    // TODO: make this more robust with canonization, so it's not tied to specific implementation.
    const ast = {"type":"application","left":{"type":"function","argument":"a","body":{"type":"function","argument":"b","body":{"type":"application","left":{"type":"variable","name":"a"},"right":{"type":"variable","name":"b"}}}},"right":{"type":"variable","name":"b"}};
    const expected = {"type":"function","argument":"ε₁","body":{"type":"application","left":{"type":"variable","name":"b"},"right":{"type":"variable","name":"ε₁"}}};
    assert.deepEqual(
      purgeAstCache(bReduce(ast)),
      expected
    );
  });
});
