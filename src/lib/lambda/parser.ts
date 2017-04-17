/* type Expression oneOf:
  { type: 'token', name: 'n'}
  { type: 'function', argument: 'n', body:  [expression]}
  { type: 'application', left: [expression], right: [expression]}

  We also for performance reasons add a cacheKey so that we don't have to recompute derived data.
*/

/*

  Q: represent textually or not?
  A: Textual representation allows for unambiguous logic/extensibility.

  Q: do we use lambda symbols in utf?
  A: hell yeah we do!
    most functions will have a string => string format (dead simple)
    but we'll also expose parsed expressions.
*/

// regex for name
// [a-zA-Z]

// regex for lambda
// λ[a-zA-Z]\..+

// regex for application
// rn I suck at parsing, so I don't know how to handle parens.
// So a lambda can only end an application.
// ^(λ[a-zA-Z]\..+[a-zA-Z]){2}$
// without just lambda expressions yet.

// str => Expression
function parseTerm(str : string){
  if (surroundedByParens(str)) {
    return parseTerm(str.slice(1, -1));
  } else if (/^[a-zA-Z]$/.test(str)) { // looks like a token
    return {
      type: 'token',
      name: str,
    }
  } else if (/^λ[a-zA-Z]\..+/.test(str)) { // Looks like a lambda expression
    return {
      type: 'function',
      argument: str[1],
      body: parseTerm(str.slice(3)),
    };
  } else if (/^[a-zA-Z]+/.test(str)) {
    // application:
    // Either gonna start with a sequence of letters,
    // or a parens'd expression, so we can divide by that.
    // this case is with a sequence of letters
    let splitPoint = str.search(/[^a-zA-Z]/);
    if (splitPoint < 0) {
      splitPoint = str.length - 1;
    }
    return {
      type: 'application',
      left: parseTerm(str.slice(0, splitPoint)),
      right: parseTerm(str.slice(splitPoint)),
    }
  } else if(/^\(/.test(str)) {
    // application, starting with a paren.
    // This case is wrong-- we should be applying greedily the first two
    // expressions that make sense, and then applying anything after that
    // in a wrapper application.
    let depth = 0;
    let splitPoint = -1;
    for (let i = 0; i < str.length; i++){
      const cur = str[i];
      if (cur === '(') {
        depth++;
      }
      if (cur === ')') {
        depth--;
      }
      if (depth === 0) {
        splitPoint = i + 1;
        break;
      }
    }
    if (splitPoint < 0) {
      throw 'Unmatched Paren';
    }
    return {
      type: 'application',
      left: parseTerm(str.slice(0, splitPoint)),
      right: parseTerm(str.slice(splitPoint)),
    }
  }

  throw 'Syntax Error';
}

function surroundedByParens(str) {
  if (str[0] !== '(' || str.slice(-1) !== ')') {
    return false;
  }
  const rest = str.slice(1,-1);
  let depth = 0;
  for (let i = 0; i < rest.length; i++){
    const cur = rest[i];
    if (cur === '(') {
      depth++;
    }
    if (cur === ')') {
      depth--;
    }
    if (depth < 0) {
      return false;
    }
  }
  return true;
}

export { parseTerm };
