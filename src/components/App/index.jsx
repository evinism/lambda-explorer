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

  /*defineVariable = (name) => {
    try {
      this.executionContext.defineVariable(name, this.state.text);
      // eeeeevil rerender forcing
      this.setState({});
    } catch(e) {
      alert('trying to define a var problem: ' + e);
    }
  }*/

  render() {
    return (
      <div>
        <h1>Lambda Explorer</h1>
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
      </div>
    );

    // ===
    // Dead for right now
    // ===
    const vars = this.executionContext.definedVariables;
    const listItems = Object.keys(vars).map(
      name => ({
        name,
        ast: vars[name],
      })
    ).map(item => (
      <li key={item.name}>{item.name}: {renderExpression(item.ast)}</li>
    ));

    const renderedVars = (<ul>{listItems}</ul>);

    let rawAst, ast, err;
    try {
      rawAst = parseTerm(this.state.text);
    } catch (e) {
      err = e;
    }

    if(rawAst){
      ast = this.executionContext.resolveVariables(rawAst);
    }
    console.log(rawAst);

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
            <LambdaMetadata ast={ast} err={err} />
            {!this.state.gameStarted && (
              <button className="start-button" onClick={this.startGame}>
                start the game yo
              </button>
            )}
            <VariableInput defineVariable={this.defineVariable} />
            <div>
              Defined Vars:
              {renderedVars}
            </div>
          </article>
        </div>
      </div>
    );
  }
}

export default App;
