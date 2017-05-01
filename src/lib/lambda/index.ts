
// ---
// lol how do i even do named exports
import { parseTerm } from './parser2';
import { renderExpression } from './renderer';
import { renderAsChurchNumeral, renderAsChurchBoolean } from './churchPrimitives';
import { getFreeVars } from './util';
import { bReduce, eReduce } from './operations';
import { toNormalForm, leftmostOutermostRedex } from './normalize';
import { tokenize } from './lexer';

export {
  parseTerm,
  renderExpression,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  getFreeVars,
  bReduce,
  eReduce,
  toNormalForm,
  leftmostOutermostRedex,
  tokenize,
}
