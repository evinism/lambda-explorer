import React from 'react';
import LambdaInput from '../LambdaInput';
import LambdaMetadata from '../LambdaMetadata';
import ProblemPrompter from '../ProblemPrompter';
import problems from '../../game/problems';

import {tokenize} from '../../lib/lambda/lexer';

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
    if (problems[pNum].winCondition({text})) {
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
      <article>
        <h1>Lambda Explorer</h1>
        <h3>shift-L to type λ, rigorous syntax only plz</h3>
        {this.state.gameStarted && (
          <ProblemPrompter problems={problems} current={this.state.problemNumber} />
        )}
        <LambdaInput onChange={this.handleInputChange} />
        <LambdaMetadata text={this.state.text} />
        {!this.state.gameStarted && (
          <button className="start-button" onClick={this.startGame}>
            start the game yo
          </button>
        )}
      </article>
    );
  }
}

export default App;
