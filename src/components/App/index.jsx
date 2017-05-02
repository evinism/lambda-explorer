import React from 'react';
import LambdaInput from '../LambdaInput';
import LambdaMetadata from '../LambdaMetadata';
import ProblemPrompter from '../ProblemPrompter';
import problems from '../../game/problems';

import { parseTerm, toNormalForm } from '../../lib/lambda/';

class App extends React.Component {
  state = {
    text: '',
    problemNumber: 0,
    gameStarted: false
  };

  handleInputChange = (text) => {
    this.setState({text});
    // TODO: omgggg move this stuff out of the component, ickkkk
    const pNum = this.state.problemNumber;
    let normalForm;
    try {
      normalForm = toNormalForm(parseTerm(text));
    } catch(e) {
      normalForm = undefined;
    }
    if (problems[pNum].winCondition({text, normalForm})) {
      if (pNum < problems.length - 1){
        this.setState({problemNumber: pNum + 1});
      } else {
        this.setState({gameStarted: false});
      }
    }
  }

  startGame = () => {
    this.setState({gameStarted: true, problemNumber: 0});
  }

  render() {
    return (
      <div>
        <h1>Lambda Explorer</h1>
        <div className="app-content">
          <article>
            <h3>shift-L to type λ, rigorous syntax only plz</h3>
            <LambdaInput onChange={this.handleInputChange} />
            <LambdaMetadata text={this.state.text} />
            {!this.state.gameStarted && (
              <button className="start-button" onClick={this.startGame}>
                start the game yo
              </button>
            )}
          </article>
          <aside>
            {this.state.gameStarted && (
              <ProblemPrompter problems={problems} current={this.state.problemNumber} />
            )}
          </aside>
        </div>
      </div>
    );
  }
}

export default App;
