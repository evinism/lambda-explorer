import React from 'react';
import LambdaMetadata from './LambdaMetadata';
import ProblemPrompter from './ProblemPrompter';
import VariableInput from './VariableInput';
import Repl from '../Repl';

import LambdaInput from '../LambdaInput';
import problems from '../../game/problems';
import ExecutionContext from '../../game/executionContext';

import {
  parseTerm,
  toNormalForm,
  renderExpression
} from '../../lib/lambda/';

class App extends React.Component {
  state = {
    text: '',
    problemNumber: 0,
    gameStarted: false
  };

  _handleOnCompute = (computation) => {
    let pNum = this.state.problemNumber;
    if (problems[pNum].winCondition(computation)) {
      if (pNum < problems.length - 1){
        this.setState({problemNumber: pNum + 1});
      } else {
        this.setState({gameStarted: false});
      }
    }
  }

  startGame = () => {
    this.setState({
      gameStarted: true,
      problemNumber: 0
    });
  }

  render() {
    return (
      <div className="app-wrapper">
        <header>
          <h1>Lambda Explorer</h1>
        </header>
        <div className="app-content">
          <article>
            <Repl onCompute={this._handleOnCompute}/>
          </article>
          <aside>
            {!this.state.gameStarted && (
              <button className="start-button" onClick={this.startGame}>
                start the game yo
              </button>
            )}
            {this.state.gameStarted && (
              <ProblemPrompter problems={problems} current={this.state.problemNumber} />
            )}
          </aside>
        </div>
        <footer>
          <a href="https://github.com/evinism/lambda-explorer">github</a>
          <a href="https://en.wikipedia.org/wiki/Lambda_calculus">lambda calculus wiki</a>
        </footer>
      </div>
    );
  }
}

export default App;
