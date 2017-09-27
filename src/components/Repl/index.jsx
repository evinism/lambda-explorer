import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';

import persistComponent from '../../util/persist';

import LambdaInput from '../LambdaInput';
import ExecutionContext from '../../game/executionContext';
import Assignment from './Assignment';
import Computation from './Computation';
import Error from './Error'

import { renderExpression, parseExtendedSyntax } from '../../lib/lambda';

const initialOutput = (
  <div className='initial-prompt'>
    lambda runtime v0.1<br />
    shift-L to type λ, [0-9] to type subscripts, := for assignment
  </div>
);

const renderEvaluation = (evaluation) => {
  switch (evaluation.type) {
    case 'assignment': {
      const { lhs, ast } = evaluation;
      const outputText = `${lhs}: ${renderExpression(ast)}`
      return ( <Assignment computation={evaluation}>{outputText}</Assignment> );
    }
    case 'computation': {
      const { normalForm } = evaluation;
      const renderedNF = normalForm && renderExpression(normalForm);
      return ( <Computation computation={evaluation}>{renderedNF}</Computation> );
    }
    case 'error': {
      const { error, ast } = evaluation;
      return ( <Error ast={ast}>{error.toString()}</Error> );
    }
  }
};

class Repl extends React.Component {
  state = {
    text: '',
    commandHistory: [],
    mutableHistory: [''],
    currentPos: 0,
    output: [initialOutput],
  }

  _onChange = (text) => {
    let error = false;
    const newArr = [].concat(this.state.mutableHistory);
    newArr[this.state.currentPos] = text
    this.setError(text);
    this.setState({mutableHistory: newArr});
  }

  setError = (text) => {
    // should probably be done in the render function anyways..
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

  _submit = async () => {
    const text = this.state.mutableHistory[this.state.currentPos];
    if (text === '') {
      this.setState({
        output: [
          ...this.state.output,
          (<span className='command'><span className='caret'>> </span></span>)
        ],
      });
      return;
    }

    const evaluation = await this.executionContext.evaluateAsync(text);
    const result = renderEvaluation(evaluation);

    let nextOutput = [
      ...this.state.output,
      (<span className='command'><span className='caret'>> </span>{text}</span>),
      result,
    ];

    const nextHistory = [...this.state.commandHistory, text];

    this.props.onCompute && this.props.onCompute(evaluation);

    this.setError('');
    this.setState({
      commandHistory: nextHistory,
      mutableHistory: [...nextHistory, ''],
      currentPos: nextHistory.length,
      output: nextOutput,
    });
  }

  _nextInHistory = () => {
    const nextPos = Math.min(
      this.state.currentPos + 1,
      this.state.mutableHistory.length - 1
    );
    this.setError(this.state.mutableHistory[nextPos]);
    if(nextPos !== this.state.currentPos) {
      this.setState({
        currentPos: nextPos
      }, this._putCursorAtEnd);
    }
  }

  _prevInHistory = () => {
    const nextPos = Math.max(this.state.currentPos - 1, 0);
    this.setError(this.state.mutableHistory[nextPos]);
    if(nextPos !== this.state.currentPos) {
      this.setState({
        currentPos: nextPos
      }, this._putCursorAtEnd);
    }
  }

  _putCursorAtEnd = () => {
    // this should be added into the lambda input tbh
    // this is garbage
    window.setTimeout(() => {
      const input = this.refs.prompt.querySelector('input');
      const selectionPos = input.value.length;
      input.selectionStart = selectionPos;
      input.selectionEnd = selectionPos;
    }, 0);
  }

  _captureUpDown = (e) => {
    if(e.key === 'ArrowDown') {
      this._nextInHistory();
    } else if(e.key === 'ArrowUp') {
      this._prevInHistory();
    }
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
        <div
          className={cx('prompt', {error: this.state.error})}
          ref='prompt'
          onKeyDown={this._captureUpDown}
        >
          <span className='prompt-caret'>> </span>
          <LambdaInput
            onChange={this._onChange}
            submit={this._submit}
            history={this.state.commandHistory}
            value={this.state.mutableHistory[this.state.currentPos]}
            className="lambda-input"
            autoFocus={true}
          />
        </div>
      </div>
    );
  }
}

export default Repl;
