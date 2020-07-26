import { LambdaExpression as Expr } from "./types";

function renderExpression(expression: Expr): string {
  switch (expression.type) {
    case "application":
      let leftSide: string;
      if (expression.left.type !== "function") {
        leftSide = renderExpression(expression.left);
      } else {
        leftSide = `(${renderExpression(expression.left)})`;
      }
      // I have no idea whether the rendering of the right side is valid.
      let rightSide: string;
      if (expression.right.type === "variable") {
        rightSide = renderExpression(expression.right);
      } else {
        rightSide = `(${renderExpression(expression.right)})`;
      }
      return `${leftSide}${rightSide}`;
    case "function":
      return `λ${expression.argument}.${renderExpression(expression.body)}`;
    case "variable":
      return expression.name;
  }
}

export { renderExpression };
