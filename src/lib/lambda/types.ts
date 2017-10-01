/*
  type LambdaToken oneOf:
  {
    type: 'lambda',
  },
  {
    type: 'dot',
  },
  {
    type: 'identifier',
    value: 'someString'
  },
  {
    type: 'openParen',
  },
  {
    type: 'closeParen',
  },
  {
    type: 'assignment',
  }
*/

/*
  types:

  [name] a character followed by a bunch of subscripts

  [expression] one of:
    {
      type: 'application',
      left: [expression],
      right: [expression]
    },
    {
      type: 'function'
      argument: [name],
      body: [expression],
    },
    {
      type: 'variable',
      name: [name],
    }

  [statement] one of:
    [expression],
    {
      type: 'assignment'
      lhs: [name],
      rhs: [expression],
    }

*/

interface SimpleToken {
  type: "lambda" | "dot" | "openParen" | "closeParen" | "assignment"
  // Typechecker fails to discriminate between simpletoken and valuedtoken in some cases
  // i hate life
  value?: 'this should never happen',
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
