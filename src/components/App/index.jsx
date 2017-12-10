import React from 'react';

import ProblemPrompter from './ProblemPrompter';
import Repl from '../Repl';

import persistComponent from '../../util/persist';

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
    let {
      currentProblem,
      shownProblem,
    } = this.state;
    if (problems[shownProblem].winCondition(computation)) {
      if (shownProblem < problems.length - 1){
        this.setState({
          currentProblem: Math.max(shownProblem + 1, currentProblem),
          shownProblem: shownProblem + 1,
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

  componentWillMount() {
    persistComponent (
      'component/App',
      () => this.state,
      newState => this.setState(newState || {})
    );
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
          <a href="https://github.com/evinism/lambda-explorer/issues">Something not right?</a>
        </footer>
      </div>
    );
  }
}

export default App;
