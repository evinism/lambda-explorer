import { assert } from 'chai';
import { addToClosure, addManyToClosure } from '../closure';

describe('Closure', () => {
    it('successfully adds a new single element to the closure', () => {
        const closure = {
            x: 'x'
        };
        const expected = {
            x: 'x',
            y: 'y',
        };
        const actual = addToClosure(closure, 'y');
        assert.deepEqual(expected, actual);
    });

    it('successfully adds multiple elements to the closure', () => {
        const closure = {
            x: 'x'
        };
        const expected = {
            x: 'x',
            y: 'y',
            z: 'z',
        };
        const actual = addManyToClosure(closure, ['y', 'z']);
        assert.deepEqual(expected, actual);
    });
});

