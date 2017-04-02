import React from 'react';
import { parseTerm, getFreeVars, renderExpression, bReduce, renderAsChurchNumeral, renderAsChurchBoolean } from '../../lib/lambda.js';

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
      ast = parseTerm(this.state.text);
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
    let renderedReduced;
    if (betaReduced) {
      renderedReduced = renderExpression(betaReduced);
    } else {
      renderedReduced = '[irreducable]';
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

    return (
      <div>
        <div>Free Variables: {renderedFreeVars}</div>
        <div>Rendered from AST: {renderedFromAst}</div>
        <div>Beta-reduced: {renderedReduced}</div>
        <div>As Church Numeral: {renderedNumeral}</div>
        <div>As Church Boolean: {renderedBoolean}</div>
      </div>
    );
  }

  componentDidUpdate(){
    this.refs.input.selectionStart = this.state.selStart;
    this.refs.input.selectionEnd = this.state.selEnd;
  }

  render(){
    return (
      <div>
        <input onChange={this.handleChange} value={this.state.text} ref='input' />
        <div>{this.renderMetadata()}</div>
      </div>
    )
  }
}
