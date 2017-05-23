
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

// expression => Maybe(bool)
export function renderAsChurchBoolean(expression){
  if (expression.type !== 'function') {
    return undefined;
  }
  if (expression.body.type !== 'function') {
    return undefined;
  }
  if (expression.body.body.type !== 'variable') {
    return undefined;
  }
  const firstArg = expression.argument;
  const secondArg = expression.body.argument;
  const target = expression.body.body.name;
  if (firstArg === target) {
    return true;
  }
  if (secondArg === target) {
    return false;
  }
  return undefined;
}
