import React from 'react';
import { parseTerm, getFreeVars } from '../../lib/lambda.js';

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

  renderFreeVars = () => {
    if (this.state.text.length === 0) {
      return (<span>[empty]</span>);
    }
    try {
      const ast = parseTerm(this.state.text);
      console.log(ast);
      const freeVars = getFreeVars(ast);
      const rendered = freeVars.map(token => (
        <span key={token.name}>{token.name}</span>
      ));
      return (<span>Free Variables: {rendered}</span>);
    } catch (err) {
      return (<span>Syntax Error</span>);
    }
  }

  componentDidUpdate(){
    this.refs.input.selectionStart = this.state.selStart;
    this.refs.input.selectionEnd = this.state.selEnd;
  }

  render(){
    return (
      <div>
        <input onChange={this.handleChange} value={this.state.text} ref='input' />
        <div>{this.renderFreeVars()}</div>
      </div>
    )
  }
}
