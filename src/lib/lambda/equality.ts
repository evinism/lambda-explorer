import { cannonize } from './cannonize';

// Equality up to alpha conversion.
function rEqual(a, b) : boolean {
  if(a.type !== b.type) {
    return false;
  }
  switch(a.type){
    // if it's free, we should hope they're the same.
    // if it's not free, we should hope that whatever renaming scheme already converted it
    case 'variable':
      return a.name === b.name;
    case 'application':
      return rEqual(a.left, b.left) && rEqual(a.right, b.right);
    case 'function':
      return rEqual(a.body, b.body)
    default:
      throw `what kind of ast node is ${a.type} you nerd?`;
  }
}


// ast1, ast2 => bool
export function equal(a, b) : boolean {
  const cA = cannonize(a);
  const cB = cannonize(b);
  return rEqual(cA, cB);
}
