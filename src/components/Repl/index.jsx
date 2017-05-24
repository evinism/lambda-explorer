import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';

import LambdaInput from '../LambdaInput';
import ExecutionContext from '../../game/executionContext';
import Computation from './Computation';


import { renderExpression, parseExtendedSyntax } from '../../lib/lambda';

const initialOutput = (
  <div className='initial-prompt'>
    lambda runtime v0.1<br />
    shift-L to type λ, [0-9] to type subscripts, := for assignment
  </div>
);

class Repl extends React.Component {
  state = {
    text: '',
    commandHistory: [],
    output: [initialOutput],
  }

  _onChange = (text) => {
    let error = false;
    this.setState({text});
    this.setError(text);
  }

  setError = (text) => {
    let error = false;
    if (text === '') {
      this.setState({error: false});
      return;
    }
    try {
      parseExtendedSyntax(text);
    } catch (e) {
      error = true;
    }
    this.setState({error: error});
  }

  _scrollToBottom = () => {
    const repl = this.refs.repl;
    repl.scrollTop = repl.scrollHeight;
  }

  _handleClick = () => {
    if(window.getSelection().isCollapsed){
      this.refs.prompt.querySelector('.lambda-input').focus();
    }
  }

  _submit = () => {
    const text = this.state.text;
    if (text === '') {
      this.setState({
        output: [
          ...this.state.output,
          (<span className='command'><span className='caret'>> </span></span>)
        ],
      });
      return;
    }
    const computation = this.executionContext.evaluate(text);
    const { error, normalForm, lhs } = computation;
    const renderedNF = normalForm && renderExpression(normalForm);
    const outputText = lhs ? `${lhs}: ${renderedNF}` : renderedNF;

    const result = (error
      ? (<span className='error'>{error.toString()}</span>)
      : (
        <span className='result'>
          <Computation computation={computation}>{outputText}</Computation>
        </span>
      )
    );

    let nextOutput = [
      ...this.state.output,
      (<span className='command'><span className='caret'>> </span>{this.state.text}</span>),
      result,
    ];

    this.props.onCompute && this.props.onCompute(computation);

    this.setError('');
    this.setState({
      text: '',
      commandHistory: [...this.state.commandHistory, text],
      output: nextOutput,
    });
  }

  componentDidUpdate(){
    this._scrollToBottom();
  }

  componentWillMount(){
    this.executionContext = new ExecutionContext();
  }

  render(){
    const renderedOutputs = this.state.output.map((elem, idx) => (
      <div key={idx}>
        {elem}
      </div>
    ));
    return (
      <div className='repl' ref='repl' onClick={this._handleClick}>
        <div className='output'>
          {this.state.output.map((elem, idx) => (
            <div key={idx}>
              {elem}
            </div>
          ))}
        </div>
        <div className={cx('prompt', {error: this.state.error})} ref='prompt'>
          <span className='prompt-caret'>> </span>
          <LambdaInput
            onChange={this._onChange}
            submit={this._submit}
            history={this.state.commandHistory}
            value={this.state.text}
            className="lambda-input"
            autoFocus={true}
          />
        </div>
      </div>
    );
  }
}

export default Repl;
