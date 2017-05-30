// Equality up to alpha conversion.
import { replace } from './operations';

// ast1, ast2 => bool
export function equal(a, b){
  if(a.type !== b.type) {
    return false;
  }
  switch(a.type){
    // if it's free, we should hope they're the same.
    // if it's not free, we should hope that whatever renaming scheme already converted it
    case 'variable':
      return a.name === b.name;
    case 'application':
      return equal(a.left, b.left) && equal(a.right, b.right);
    case 'function':
      // TODO: combine this rename with the one that's in replace, so they share the code.
      // should be a simple interface when it happens
      if (a.argument !== b.argument){
        const renamedB = {
          type: 'function',
          argument: a.argument,
          body: replace(
            b.argument,
            { type: 'variable', name: a.argument },
            b.body
          ),
        };
        return equal(a.body, renamedB.body)
      } else {
        return equal(a.body, b.body)
      }
    default:
      throw `what kind of ast node is ${a.type} you nerd?`;
  }
}
