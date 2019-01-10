
// ---
// lol how do i even do named exports
import { parseTerm, parseExtendedSyntax } from './parser';
import { renderExpression } from './renderer';
import { renderAsChurchNumeral, renderAsChurchBoolean } from './churchPrimitives';
import { getFreeVars, purgeAstCache } from './util';
import { bReduce, eReduce, replace } from './operations';
import { toNormalForm, leftmostOutermostRedex } from './normalize';
import { tokenize } from './lexer';
import { equal } from './equality';

export {
  parseTerm,
  parseExtendedSyntax,
  renderExpression,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  getFreeVars,
  bReduce,
  eReduce,
  toNormalForm,
  leftmostOutermostRedex,
  tokenize,
  replace,
  equal,
  purgeAstCache,
}
