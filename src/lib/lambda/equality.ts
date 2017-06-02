// Equality up to alpha conversion.
import { replace } from './operations';
import { renderExpression } from './renderer';

// Cannonize changes all names of arguments to a preset
function cannonize(ast){
  let count = 0;
  return rCannonize(ast);

  function generateNewName(){
    count++;
    return `[_c${count}]`;
  }

  function rCannonize(a) {
    switch(a.type){
      case 'variable':
        return a;
      case 'application':
        return {
          type: 'application',
          left: rCannonize(a.left),
          right: rCannonize(a.right),
        };
      case 'function':
        let newName = generateNewName();
        return {
          type: 'function',
          argument: newName,
          body: rCannonize(
            replace(
              a.argument,
              { type: 'variable', name: newName },
              a.body,
            )
          )
        };
      default:
        throw `what kind of ast node is ${a.type} you nerd?`;
    }
  }
}

function rEqual(a, b){
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
export function equal(a, b){
  const cA = cannonize(a);
  const cB = cannonize(b);
  console.log(renderExpression(cA));
  return rEqual(cA, cB);
}
