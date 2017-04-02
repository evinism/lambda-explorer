import React from 'react';
import { parseTerm, getFreeVars, renderExpression } from '../../lib/lambda.js';

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
    // Success in this case
    console.log(ast);
    const freeVars = getFreeVars(ast);
    const renderedFreeVars = freeVars.map(token => (
      <span key={token.name}>{token.name}</span>
    ));
    const renderedFromAst = renderExpression(ast);
    return (
      <div>
        <div>Free Variables: {renderedFreeVars}</div>
        <div>Rendered from AST: {renderedFromAst}</div>
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
