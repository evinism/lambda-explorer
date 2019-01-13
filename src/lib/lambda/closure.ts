import {Closure, Name} from './types';

export function addToClosure(closure : Closure, name : Name) : Closure {
    // I wonder if this makes things abhorrently slow
    return {
        ...closure,
        [name]: name
    };
}

export function addManyToClosure(closure : Closure, names : [ Name ]) {
    const newElems : Closure = {};
    for (const name of names){
        newElems[name] = name;
    }
    return {...closure, ...newElems };
}