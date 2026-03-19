import React from 'react';
import cx from 'classnames';

import persistComponent from "../../util/persist.js";

import LambdaInput from '../LambdaInput';
import LambdaActor from '../../lambdaActor/actor.js';

import Assignment from './Assignment';
import Computation from './Computation';
import Error from './Error'
import Info from './Info';

import {
  renderExpression,
  parseExtendedSyntax,
  parseTerm,
} from "../../lib/lambda/index.ts";

const initialOutput = (
  <Info>
    lambda runtime v0.1<br />
    \ to type λ, [0-9] to type subscripts, := for assignment, upper-case for multi-letter variables
  </Info>
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
      return ( <Error ast={ast} error={error}>{error.message}</Error> );
    }
    case 'info': {
      const { message } = evaluation;
      return ( <Info>{message} </Info> );
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

  deleteDefinition = (name) => {
    delete this.lambdaActor.executionContext.definedVariables[name];
    this.props.onDefinitionsChange && this.props.onDefinitionsChange(
      {...this.lambdaActor.executionContext.definedVariables}
    );
  }

  insertText = (text) => {
    const current = this.state.mutableHistory[this.state.currentPos] || '';
    const newText = current + text + ' ';
    const newArr = [].concat(this.state.mutableHistory);
    newArr[this.state.currentPos] = newText;
    this.setError(newText);
    this.setState({ mutableHistory: newArr });
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

    await this._submitMultiple([text]);
  }

  _submitMultiple = async (lines) => {
    let output = [...this.state.output];
    let commandHistory = [...this.state.commandHistory];

    for (const line of lines) {
      const evaluation = await this.lambdaActor.send(line);
      // Line is purely a comment. Format output and then just pass it through
      // without calling onCompute or onDefinitionsChange.
      if (!evaluation) {
        output = [...output, (
          <div className='command' title={line}>
            <span className='caret'>> </span>
            {line}
          </div>
        )];
        commandHistory = [...commandHistory, line];
        continue;
      }

      // Add execution context so _handleOnCompute can check win conditions that
      // depend on variable definitions.
      const enriched = {
        ...evaluation,
        executionContext: this.lambdaActor.executionContext,
      };
      // Format command.
      output = [...output, (
        <div className='command' title={enriched.text}>
          <span className='caret'>> </span>
          {enriched.text}
        </div>
      ), renderEvaluation(enriched)];
      // Add to history and pass to onCompute callback and onDefinitionsChange callback.
      commandHistory = [...commandHistory, enriched.text];
      this.props.onCompute && this.props.onCompute(enriched);
      this.props.onDefinitionsChange && this.props.onDefinitionsChange(
        {...this.lambdaActor.executionContext.definedVariables}
      );

      if (enriched.type === 'error') {
        break;
      }
    }

    this.setError('');
    this.setState({
      commandHistory,
      mutableHistory: [...commandHistory, ''],
      currentPos: commandHistory.length,
      output,
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
    this.lambdaActor = new LambdaActor();

    const saved = this.props.stringDefinitions;
    if (saved && Object.keys(saved).length > 0) {
      for (const [name, expr] of Object.entries(saved)) {
        this.lambdaActor.executionContext.definedVariables[name] = parseTerm(expr);
      }
      this.props.onDefinitionsChange && this.props.onDefinitionsChange(
        {...this.lambdaActor.executionContext.definedVariables}
      );
    }
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
            submitMultiple={this._submitMultiple}
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
