import React from 'react';
import LambdaMetadata from './LambdaMetadata';
import ProblemPrompter from './ProblemPrompter';
import VariableInput from './VariableInput';

import LambdaInput from '../LambdaInput';
import problems from '../../game/problems';
import executionContext from '../../game/executionContext';

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
    let normalForm, ast;
    try {
      ast = parseTerm(text);
      console.log(ast);
      normalForm = toNormalForm(ast);
    } catch(e) {
      normalForm = undefined;
    }
    if (problems[pNum].winCondition({text, normalForm, ast})) {
      if (pNum < problems.length - 1){
        this.setState({problemNumber: pNum + 1});
      } else {
        this.setState({gameStarted: false});
      }
    }
  }

  componentDidMount = () => {

  }


  startGame = () => {
    this.setState({gameStarted: true, problemNumber: 0});
  }

  defineVariable = (name) => {

  }

  render() {
    return (
      <div>
        <h1>Lambda Explorer</h1>
        <div className="app-content">
          <article>
            <h3>shift-L to type λ, [0-9] to type subscripts, rigorous syntax only plz</h3>
            <LambdaInput
              className="lambda-input"
              autoFocus={true}
              onChange={this.handleInputChange}
            />
            <LambdaMetadata text={this.state.text} />
            {!this.state.gameStarted && (
              <button className="start-button" onClick={this.startGame}>
                start the game yo
              </button>
            )}
            <VariableInput defineVariable={this.defineVariable} />
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
