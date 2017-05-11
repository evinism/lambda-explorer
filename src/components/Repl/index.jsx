import React from 'react';
import LambdaInput from '../LambdaInput';
import ExecutionContext from '../../game/executionContext';
import Computation from './Computation';

import { renderExpression } from '../../lib/lambda';

const initialOutput = (
  <div className='initial-prompt'>
    lambda runtime<br />
    shift-L to type λ, [0-9] to type subscripts, rigorous syntax only plz
  </div>
);

class Repl extends React.Component {
  state = {
    text: '',
    commandHistory: [],
    output: [initialOutput],
  }

  _onChange = (text) => {
    this.setState({text});
  }

  _scrollToBottom = () => {
    this.refs.repl.scrollTop = 1000000;
  }

  _submit = () => {
    const text = this.state.text;
    const computation = this.executionContext.evaluate(text);
    const { error, normalForm } = computation;

    const result = (error
      ? (<span className='error'>{error.toString()}</span>)
      : (
        <span className='result'>
          <Computation computation={computation}>{renderExpression(normalForm)}</Computation>
        </span>
      )
    );

    let nextOutput = [
      ...this.state.output,
      (<span className='command'><span className='caret'>> </span>{this.state.text}</span>),
      result,
    ];

    this.props.onCompute && this.props.onCompute(computation);

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
      <div className='repl' ref='repl'>
        <div className='output'>
          {this.state.output.map((elem, idx) => (
            <div key={idx}>
              {elem}
            </div>
          ))}
        </div>
        <div className='prompt'>
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
