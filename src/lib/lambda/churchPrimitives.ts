import { equal } from './equality';
import { parseTerm } from './parser';

// expression => Maybe(number)
export function renderAsChurchNumeral(expression) {
  if (expression.type !== 'function') {
    return undefined;
  }
  const outerName = expression.argument;
  const inner = expression.body;
  if (inner.type !== 'function') {
    return undefined;
  }
  const innerName = inner.argument;
  // name => name => Expression => int
  function countLevels(wrapperName, targetName, piece) {
    if (piece.type === 'variable') {
      if (piece.name !== targetName) {
        return undefined;
      } else {
        return 0;
      }
    }
    if (piece.type === 'application') {
      if (piece.left.type !== 'variable' || piece.left.name !== wrapperName) {
        return undefined;
      } else {
        const nextLevel = countLevels(wrapperName, targetName, piece.right);
        if (nextLevel === undefined){
          return undefined;
        } else {
          return nextLevel + 1;
        }
      }
    }
    return undefined;
  }

  return countLevels(outerName, innerName, inner.body);
}

const churchTrue = parseTerm('λab.a');
const churchFalse = parseTerm('λab.b');

// expression => Maybe(bool)
export function renderAsChurchBoolean(expression){
  if (equal(expression, churchTrue)) {
    return true;
  }
  if (equal(expression, churchFalse)) {
    return false;
  }
  return undefined;
}
