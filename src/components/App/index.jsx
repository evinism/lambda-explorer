import React from 'react';
import LambdaMetadata from './LambdaMetadata';
import ProblemPrompter from './ProblemPrompter';
import VariableInput from './VariableInput';
import Repl from '../Repl';

import LambdaInput from '../LambdaInput';
import problems from '../../game/problems';
import ExecutionContext from '../../game/executionContext';

const StartPrompt = ({start}) => (
  <div>
    <p>
      Interactive REPL and tutorial for the untyped Lambda Calculus
    </p>
    <p>
      Click <button onClick={start}>here</button> to begin the tutorial
    </p>
  </div>
);

class App extends React.Component {
  state = {
    text: '',
    problemNumber: 16,
    gameStarted: true
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
              <StartPrompt start={this.startGame} />
            )}
            {this.state.gameStarted && (
              <ProblemPrompter problems={problems} current={this.state.problemNumber} />
            )}
          </aside>
        </div>
        <footer>
          Lambda Calculus tutorial by Evin Sellin in the style of <a href="https://www.tryhaskell.org/">Try Haskell</a>
          <a href="https://github.com/evinism/lambda-explorer">Github</a>
          <a href="https://en.wikipedia.org/wiki/Lambda_calculus">Lambda Calculus Wiki</a>
        </footer>
      </div>
    );
  }
}

export default App;
