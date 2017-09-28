import { assert } from 'chai';
import { toNormalForm, leftmostOutermostRedex } from '../normalize';

describe('Normalize', function(){
  it('Handles top level beta reductions', function(done){
    const ast = {
      type: 'application',
      left: {
        type: 'function',
        argument: 'a',
        body: { type: 'variable', name: 'a' },
      },
      right: { type: 'variable', name: 'b' },
    };
    const expected = { type: 'variable', name: 'b' };
    const normalized = toNormalForm(ast);
    assert.deepEqual(normalized, expected);
    done();
  });

  it('Evaluates redexes in normal order', function(done){
    const ast = {"type":"application","left":{"type":"application","left":{"type":"function","argument":"b","body":{"type":"variable","name":"b"}},"right":{"type":"variable","name":"c"}},"right":{"type":"application","left":{"type":"function","argument":"d","body":{"type":"variable","name":"d"}},"right":{"type":"variable","name":"e"}}};
    const expected = {"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"application","left":{"type":"function","argument":"d","body":{"type":"variable","name":"d"}},"right":{"type":"variable","name":"e"}}};
    const redexed = leftmostOutermostRedex(ast);
    assert.deepEqual(redexed, expected);
    done();
  });

  it('fails to find redexes where none exist', function(done){
    const ast = {"type":"application","left":{"type":"variable","name":"f"},"right":{"type":"function","argument":"a","body":{"type":"function","argument":"b","body":{"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"function","argument":"d","body":{"type":"variable","name":"e"}}}}}};
    const redexed = leftmostOutermostRedex(ast);
    assert.deepEqual(undefined, redexed);
    done();
  });
});
