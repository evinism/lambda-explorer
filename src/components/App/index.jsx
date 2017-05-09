import React from 'react';
import LambdaMetadata from './LambdaMetadata';
import ProblemPrompter from './ProblemPrompter';
import VariableInput from './VariableInput';

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

  handleInputChange = (text) => {
    this.setState({text});
    // TODO: omgggg move this stuff out of the component, ickkkk
    const pNum = this.state.problemNumber;
    let normalForm, ast;
    try {
      ast = parseTerm(text);
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

  componentWillMount = () => {
    this.executionContext = new ExecutionContext();
  }


  startGame = () => {
    this.setState({
      gameStarted: true,
      problemNumber: 0
    });
  }

  defineVariable = (name) => {
    try {
      this.executionContext.defineVariable(name, this.state.text);
      // eeeeevil rerender forcing
      this.setState({});
    } catch(e) {
      alert('trying to define a var problem: ' + e);
    }
  }

  render() {
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
      rawAst = parseTerm(this.state.text.replace(/\s/g, ''));
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
