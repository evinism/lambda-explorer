import {
  getFreeVars,
  renderExpression,
  bReduce,
  eReduce,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  toNormalForm,
  leftmostOutermostRedex,
  tokenize,
} from '../lib/lambda';

function astToMetadata(ast){
  const freeVars = getFreeVars(ast);
  const renderedFromAst = renderExpression(ast);
  const betaReduced = bReduce(ast);
  const etaReduced = eReduce(ast);
  const asNumeral = renderAsChurchNumeral(ast);
  const asBoolean = renderAsChurchBoolean(ast);
  const normalForm = toNormalForm(ast);
  const normAsNumeral = renderAsChurchNumeral(normalForm);
  const normAsBoolean = renderAsChurchBoolean(normalForm);

  // -- Steps to recreate
  const maxDepth = 100;
  let stepsToNormal = [ast];
  for (let i = 0; i < maxDepth; i++) {
    const nextStep = leftmostOutermostRedex(stepsToNormal[stepsToNormal.length - 1]);
    if (nextStep === undefined) {
      break;
    }
    stepsToNormal.push(nextStep);
  }

  return ({
    freeVars,
    renderedFromAst,
    betaReduced,
    etaReduced,
    asNumeral,
    asBoolean,
    normalForm,
    normAsNumeral,
    normAsBoolean,
    stepsToNormal,
  });
};

export default astToMetadata;
