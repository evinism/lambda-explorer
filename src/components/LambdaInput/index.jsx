import React from 'react';
import {
  parseTerm,
  getFreeVars,
  renderExpression,
  bReduce,
  eReduce,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  toNormalForm,
  leftmostOutermostRedex,
} from '../../lib/lambda.js';

export default class LambdaInput extends React.Component {
  state = {text: ''};

  handleChange = (e) => {
    const text = e.target.value.replace(/L/g, 'λ');
    this.setState({
      text,
      selStart: e.target.selectionStart,
      selEnd: e.target.selectionEnd,
    });
  };

  renderMetadata = () => {
    if (this.state.text.length === 0) {
      return (<div>[empty]</div>);
    }
    let ast;
    try {
      ast = parseTerm(this.state.text.replace(/\s/g, ''));
    } catch (err) {
      return (<div>{err}</div>);
    }

    // -- free vars
    const freeVars = getFreeVars(ast);
    const renderedFreeVars = freeVars.map(token => (
      <span key={token.name}>{token.name}</span>
    ));

    // -- ast
    const renderedFromAst = renderExpression(ast);

    // -- beta reduction
    const betaReduced = bReduce(ast);
    let renderedBetaReduced;
    if (betaReduced) {
      renderedBetaReduced = renderExpression(betaReduced);
    } else {
      renderedBetaReduced = '[beta irreducable]';
    }

    // -- eta reduction
    const etaReduced = eReduce(ast);
    let renderedEtaReduced;
    if (etaReduced) {
      renderedEtaReduced = renderExpression(etaReduced);
    } else {
      renderedEtaReduced = '[eta irreducable]';
    }

    // -- church numerals
    const asNumeral = renderAsChurchNumeral(ast);
    let renderedNumeral;
    if (asNumeral !== undefined) {
      renderedNumeral = asNumeral;
    } else {
      renderedNumeral = '[not a church numeral]'
    }

    // -- church booleans
    const asBoolean = renderAsChurchBoolean(ast);
    let renderedBoolean;
    if (asBoolean !== undefined) {
      renderedBoolean = String(asBoolean);
    } else {
      renderedBoolean = '[not a church boolean]'
    }

    // -- normal form
    const normalForm = toNormalForm(ast);
    let renderedNormalForm;
    if (normalForm) {
      renderedNormalForm = renderExpression(normalForm);
    } else {
      renderedNormalForm = renderExpression(ast);
    }

    // -- normal form church numerals
    const normAsNumeral = renderAsChurchNumeral(normalForm);
    let renderedNormNumeral;
    if (normAsNumeral !== undefined) {
      renderedNormNumeral = normAsNumeral;
    } else {
      renderedNormNumeral = '[not a church numeral]'
    }

    // -- normal form church booleans
    const normAsBoolean = renderAsChurchBoolean(normalForm);
    let renderedNormBoolean;
    if (normAsBoolean !== undefined) {
      renderedNormBoolean = String(normAsBoolean);
    } else {
      renderedNormBoolean = '[not a church boolean]'
    }

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
    const renderedStepsToNormal = (
      <ol>
        {stepsToNormal.map((step, idx) => (
          <li key={idx}>{renderExpression(step)}</li>
        ))}
      </ol>
    );

    return (
      <div>
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
  }

  componentDidUpdate(){
    this.refs.input.selectionStart = this.state.selStart;
    this.refs.input.selectionEnd = this.state.selEnd;
  }

  render(){
    return (
      <div className="lambda-holder">
        <input className="lambda-input" onChange={this.handleChange} value={this.state.text} ref='input' />
        <div>{this.renderMetadata()}</div>
      </div>
    )
  }
}
