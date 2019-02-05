interface SimpleToken {
  type: "lambda" | "dot" | "openParen" | "closeParen" | "assignment"
}

interface ValuedToken {
  type: "identifier",
  value: string,
}

export type LambdaToken = SimpleToken | ValuedToken;

export type Name = string;

/* Lexer types */

/* AST types */
export interface FunctionExpression {
  type: "function",
  argument: Name,
  body: LambdaExpression,
}

export interface VariableExpression {
  type: "variable",
  name: Name,
}

export interface ApplicationExpression {
  type: "application",
  left: LambdaExpression,
  right: LambdaExpression
}

export interface AssignmentExpression {
  type: "assignment"
  lhs: Name
  rhs: LambdaExpression
}

export type LambdaExpression = FunctionExpression | VariableExpression | ApplicationExpression;
export type LambdaStatement = AssignmentExpression | LambdaExpression;

// util type:
export type Maybe<T> = T | undefined;
