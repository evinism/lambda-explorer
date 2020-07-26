export interface SimpleToken {
  type: "lambda" | "dot" | "openParen" | "closeParen" | "assignment";
}

export interface ValuedToken {
  type: "identifier";
  value: string;
}

export type LambdaToken = SimpleToken | ValuedToken;

export type Name = string;

/* Lexer types */

/* AST types */
export interface FunctionExpression<T = LambdaExpression> {
  type: "function";
  argument: Name;
  body: T;
}

export interface VariableExpression {
  type: "variable";
  name: Name;
}

export interface ApplicationExpression<
  L = LambdaExpression,
  R = LambdaExpression
> {
  type: "application";
  left: L;
  right: R;
}

export interface AssignmentExpression<T = LambdaExpression> {
  type: "assignment";
  lhs: Name;
  rhs: T;
}

interface CacheEntry<T> {
  computedWith: LambdaExpression;
  value: T;
}

type Cacheable<T = any> = {
  __cache__?: { [key: string]: CacheEntry<T> };
};

export type LambdaExpression = (
  | FunctionExpression
  | VariableExpression
  | ApplicationExpression
) &
  Cacheable;
export type LambdaStatement = AssignmentExpression | LambdaExpression;

// util type:
export type Maybe<T> = T | undefined;
