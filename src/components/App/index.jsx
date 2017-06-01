import React from 'react';

import LambdaMetadata from './LambdaMetadata';
import ProblemPrompter from './ProblemPrompter';
import VariableInput from './VariableInput';
import Repl from '../Repl';

import LambdaInput from '../LambdaInput';
import problems from '../../game/problems';

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

const defaultState = {
  currentProblem: 0,
  gameStarted: false,
  shownProblem: 0,
};

class App extends React.Component {
  state = defaultState;

  _handleOnCompute = (computation) => {
    let pNum = this.state.currentProblem;
    if (problems[pNum].winCondition(computation)) {
      if (pNum < problems.length - 1){
        this.setState({
          currentProblem: pNum + 1,
          shownProblem: pNum + 1,
        });
      } else {
        this.setState({gameStarted: false});
      }
    }
  }

  startGame = () => {
    this.setState({
      gameStarted: true,
      currentProblem: 0,
      shownProblem: 0,
    });
  }

  _handleNext = () => {
    this.setState({
      shownProblem: Math.min(
        this.state.shownProblem + 1,
        this.state.currentProblem
      ),
    });
  }

  _handlePrev = () => {
    this.setState({
      shownProblem: Math.max(
        this.state.shownProblem - 1,
        0
      )
    });
  }

  // Persistent hack, certainly not excellent code, for singleton only
  componentWillMount() {
    const prevState = (window.location.search !== '?reset') &&
      JSON.parse(localStorage.getItem('component/App')) ||
      {};
    this.setState(prevState);
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('component/App', JSON.stringify(this.state));
    });
  }

  render() {
    const {
      gameStarted,
      shownProblem,
      currentProblem,
    } = this.state;
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
            {!gameStarted && (
              <StartPrompt start={this.startGame} />
            )}
            {gameStarted && (
              <div>
                <ProblemPrompter
                  problems={problems}
                  current={currentProblem}
                  shown={shownProblem}
                />
                <div className="problem-navigator">
                  {shownProblem > 0 && (
                    <button className='prev-problem' onClick={this._handlePrev}>‹</button>
                  )}
                  {shownProblem < currentProblem && (
                    <button className='next-problem' onClick={this._handleNext}>›</button>
                  )}
                </div>
              </div>
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
