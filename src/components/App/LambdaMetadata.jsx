import React from 'react';
import astToMetadata from '../../game/astToMetadata';
import {
  parseTerm,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  renderExpression,
} from '../../lib/lambda';

const LambdaMetadata = ({ast, err}) => {
  console.log(ast);
  if(!ast){
    return (<div>{err}</div>);
  }

  const metadata = astToMetadata(ast);
  const renderedFreeVars = metadata.freeVars.map(token => (
    <span key={token.name}>{token.name}</span>
  ));

  const renderedFromAst = renderExpression(ast);
  let renderedBetaReduced;
  if (metadata.betaReduced) {
    renderedBetaReduced = renderExpression(metadata.betaReduced);
  } else {
    renderedBetaReduced = '[beta irreducable]';
  }

  // -- eta reduction
  let renderedEtaReduced;
  if (metadata.etaReduced) {
    renderedEtaReduced = renderExpression(metadata.etaReduced);
  } else {
    renderedEtaReduced = '[eta irreducable]';
  }

  let renderedNumeral;
  if (metadata.asNumeral !== undefined) {
    renderedNumeral = metadata.asNumeral;
  } else {
    renderedNumeral = '[not a church numeral]'
  }

  // -- church booleans
  let renderedBoolean;
  if (metadata.asBoolean !== undefined) {
    renderedBoolean = String(metadata.asBoolean);
  } else {
    renderedBoolean = '[not a church boolean]'
  }

  // -- normal form
  let renderedNormalForm;
  if (metadata.normalForm) {
    renderedNormalForm = renderExpression(metadata.normalForm);
  } else {
    renderedNormalForm = renderExpression(metadata.ast);
  }
  // -- normal form church numerals
  let renderedNormNumeral;
  if (metadata.normAsNumeral !== undefined) {
    renderedNormNumeral = metadata.normAsNumeral;
  } else {
    renderedNormNumeral = '[not a church numeral]'
  }

  // -- normal form church booleans
  let renderedNormBoolean;
  if (metadata.normAsBoolean !== undefined) {
    renderedNormBoolean = String(metadata.normAsBoolean);
  } else {
    renderedNormBoolean = '[not a church boolean]'
  }

  const renderedStepsToNormal = (
    <ol>
      {metadata.stepsToNormal.map((step, idx) => (
        <li key={idx}>{renderExpression(step)}</li>
      ))}
    </ol>
  );

  return (
    <div>
      <b>Post variable substitution:</b>
      <div>Free Variables: {renderedFreeVars}</div>
      <div>Rendered from AST: {renderedFromAst}</div>
      <div>Beta-reduced: {renderedBetaReduced}</div>
      <div>Eta-reduced: {renderedEtaReduced}</div>
      <div>As Church Numeral: {renderedNumeral}</div>
      <div>As Church Boolean: {renderedBoolean}</div>
      <div>Normal Form: {renderedNormalForm}</div>
      <div>Normal As Church Numeral: {renderedNormNumeral}</div>
      <div>Normal As Church Boolean: {renderedNormBoolean}</div>
      <div><h3>steps to normal form:</h3>{renderedStepsToNormal}</div>
    </div>
  );
};

export default LambdaMetadata;
