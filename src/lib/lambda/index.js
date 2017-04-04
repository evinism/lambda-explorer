
// ---
// lol how do i even do named exports
import { parseTerm } from './parser';
import { renderExpression } from './renderer';
import { renderAsChurchNumeral, renderAsChurchBoolean } from './churchPrimitives';
import { getFreeVars } from './util';
import { bReduce, eReduce } from './operations';
import { toNormalForm, leftmostOutermostRedex } from './normalize';

export {
  parseTerm,
  renderExpression,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  getFreeVars,
  bReduce,
  eReduce,
  toNormalForm,
  leftmostOutermostRedex
}
