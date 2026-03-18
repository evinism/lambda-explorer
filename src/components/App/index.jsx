import React from 'react';

import ProblemPrompter from "./ProblemPrompter.jsx";
import DefinitionsExplorer from "../DefinitionsExplorer/index.jsx";
import Repl from "../Repl/index.jsx";
import persistComponent from "../../util/persist.js";
import problems from "../../game/problems/index.js";

import {
  renderExpression,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
} from "../../lib/lambda/index.ts";

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
  darkMode: false,
  definitions: [],
  savedDefinitions: {},
  definitionsCollapsed: false,
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

  _handleDefinitionsChange = (rawDefs) => {
    const definitions = [];
    const savedDefinitions = {};
    for (const [name, ast] of Object.entries(rawDefs)) {
      const expression = renderExpression(ast);
      definitions.push({
        name,
        expression,
        churchNumeral: renderAsChurchNumeral(ast),
        churchBoolean: renderAsChurchBoolean(ast),
      });
      savedDefinitions[name] = expression;
    }
    this.setState({ definitions, savedDefinitions });
  }

  _toggleDefinitions = () => {
    this.setState({ definitionsCollapsed: !this.state.definitionsCollapsed });
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
      () => {
        const { definitions, ...rest } = this.state; // eslint-disable-line no-unused-vars
        return rest;
      },
      newState => this.setState(newState || {})
    );

    if (window.location.search.includes('devmode')) {
      this.setState({
        gameStarted: true,
        currentProblem: problems.length - 1,
        shownProblem: 0,
      });
    }
  }

  _toggleDarkLight = () => {
    this.setState({
      darkMode: !this.state.darkMode,
    });
  }

  render() {
    const {
      gameStarted,
      shownProblem,
      currentProblem,
      darkMode,
    } = this.state;

    return (
      <div className={'app-wrapper' + (darkMode ? ' dark-mode' : '')}>
        <header>
          <h1>Lambda Explorer</h1>
        </header>
        <div className="app-content">
          <article>
            <Repl
              onCompute={this._handleOnCompute}
              onDefinitionsChange={this._handleDefinitionsChange}
              savedDefinitions={this.state.savedDefinitions}
            />
          </article>
          <aside>
            {!gameStarted && (
              <StartPrompt start={this.startGame} />
            )}
            {gameStarted && (
              <ProblemPrompter
                problems={problems}
                current={currentProblem}
                shown={shownProblem}
                handlePrevClick={this._handlePrev}
                handleNextClick={this._handleNext}
              />
            )}
            <DefinitionsExplorer
              definitions={this.state.definitions}
              collapsed={this.state.definitionsCollapsed}
              onToggle={this._toggleDefinitions}
            />
          </aside>
        </div>
        <footer>
          Lambda Calculus tutorial by Evin Sellin in the style of <a href="https://www.tryhaskell.org/">Try Haskell</a>
          <a href="https://github.com/evinism/lambda-explorer">Github</a>
          <a href="https://en.wikipedia.org/wiki/Lambda_calculus">Lambda Calculus Wiki</a>
          <a href="https://github.com/evinism/lambda-explorer/issues">Something not right?</a>
          <a href="javascript:;" onClick={this._toggleDarkLight}>
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </a>
        </footer>
      </div>
    );
  }
}

export default App;
