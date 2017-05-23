import { uniqBy } from 'ramda';

// TODO: Should for consistensy change to [name]
// Expression => [VariableNode, ...]
function getFreeVars(expression){
  switch(expression.type){
    case 'variable':
      return [expression];
    case 'function':
      return getFreeVars(expression.body).filter(
        token => token.name !== expression.argument
      );
    case 'application':
      const leftFree = getFreeVars(expression.left);
      const rightFree = getFreeVars(expression.right);
      return uniqBy(
        term => term.name,
        leftFree.concat(rightFree)
      );
  }
}

function nextAvailableName(names){
  // shit alg that works.
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  return alphabet.split('').filter(letter => names.includes(letter))[0];
}

export {
  getFreeVars,
  nextAvailableName
};
