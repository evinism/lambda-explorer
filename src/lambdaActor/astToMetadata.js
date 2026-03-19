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
} from "../lib/lambda/index.ts";

function astToMetadata(ast, { maxDepth = 1000, etaReduce = false } = {}){
  const freeVars = getFreeVars(ast);
  const renderedFromAst = renderExpression(ast);
  const betaReduced = bReduce(ast);
  const etaReduced = eReduce(ast);
  const asNumeral = renderAsChurchNumeral(ast);
  const asBoolean = renderAsChurchBoolean(ast);
  const normalForm = toNormalForm(ast, { depthOverflow: maxDepth, etaReduce });
  const normAsNumeral = renderAsChurchNumeral(normalForm);
  const normAsBoolean = renderAsChurchBoolean(normalForm);

  // -- Steps to recreate
  let stepsToNormal = [ast];
  for (let i = 0; i < maxDepth; i++) {
    const nextStep = leftmostOutermostRedex(stepsToNormal[stepsToNormal.length - 1], etaReduce);
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
