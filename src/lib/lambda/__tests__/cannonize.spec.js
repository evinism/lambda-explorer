import { assert } from 'chai';
import { cannonize } from "../cannonize.js";

describe('Cannonize', function(){
  it('cannonizes two alpha-equivalent church numerals equivalently', function(done){
    const a = {"type":"function","argument":"a","body":{"type":"function","argument":"b","body":{"type":"application","left":{"type":"variable","name":"a"},"right":{"type":"application","left":{"type":"variable","name":"a"},"right":{"type":"application","left":{"type":"variable","name":"a"},"right":{"type":"application","left":{"type":"variable","name":"a"},"right":{"type":"application","left":{"type":"variable","name":"a"},"right":{"type":"application","left":{"type":"variable","name":"a"},"right":{"type":"variable","name":"b"}}}}}}}}};
    const b = {"type":"function","argument":"c","body":{"type":"function","argument":"d","body":{"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"application","left":{"type":"variable","name":"c"},"right":{"type":"variable","name":"d"}}}}}}}}};
    assert.deepEqual(cannonize(a), cannonize(b));
    done();
  });
});
