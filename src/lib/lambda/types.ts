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


export type Name = string;

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
