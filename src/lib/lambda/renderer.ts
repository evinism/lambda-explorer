function renderExpression(expression) {
  switch(expression.type) {
    case 'application':
      let leftSide;
      if(expression.left.type !== 'function'){
        leftSide = renderExpression(expression.left);
      } else {
        leftSide = `(${renderExpression(expression.left)})`
      }
      // I have no idea whether the rendering of the right side is valid.
      let rightSide;
      //if(expression.right.type !== 'application'){
        rightSide = renderExpression(expression.right)
      //} else {
      //  rightSide = `(${renderExpression(expression.right)})`
      //}
      return `(${leftSide}${rightSide})`;
    case 'function':
      return `λ${expression.argument}.${renderExpression(expression.body)}`
    case 'token':
      return expression.name;
  }
}

export { renderExpression };
