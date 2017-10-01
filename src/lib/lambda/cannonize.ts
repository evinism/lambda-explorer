import { replace } from './operations';
import { LambdaExpression as Expr } from './types';

// Deterministically renames all variables in an expression
// such that if there exists an alpha conversion between two ASTs,
// the cannonized asts are identical
// Expression => Expression
export function cannonize(ast : Expr) : Expr{
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
