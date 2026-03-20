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
  renderedDefinitions: [],
  stringDefinitions: {}, // persisted to localStorage, re-parsed on reload
  definitionsCollapsed: false,
  evaluationDepth: parseInt(localStorage.getItem('evaluationDepth'), 10) || 1000,
  settingsOpen: false,
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

  _handleDefinitionsChange = (defs) => {
    const renderedDefinitions = [];
    const stringDefinitions = {};
    for (const [name, ast] of Object.entries(defs)) {
      const expression = renderExpression(ast);
      renderedDefinitions.push({
        name,
        expression,
        churchNumeral: renderAsChurchNumeral(ast),
        churchBoolean: renderAsChurchBoolean(ast),
      });
      stringDefinitions[name] = expression;
    }
    this.setState({ renderedDefinitions, stringDefinitions });
  }

  _handleInsertDefinition = (name) => {
    this.replRef && this.replRef.insertText(name);
  }

  _handleDeleteDefinition = (name) => {
    this.replRef && this.replRef.deleteDefinition(name);
  }

  _toggleDefinitions = () => {
    this.setState({ definitionsCollapsed: !this.state.definitionsCollapsed });
  }

  _toggleSettings = () => {
    this.setState(prev => ({ settingsOpen: !prev.settingsOpen }));
  }

  _handleDocumentClick = (e) => {
    if (this.state.settingsOpen && this.settingsRef && !this.settingsRef.contains(e.target)) {
      this.setState({ settingsOpen: false });
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this._handleDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this._handleDocumentClick);
  }

  _setEvaluationDepth = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      this.setState({ evaluationDepth: value });
      localStorage.setItem('evaluationDepth', value);
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
      () => {
        const { renderedDefinitions, ...rest } = this.state; // eslint-disable-line no-unused-vars
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

    document.body.classList.toggle('dark-mode', darkMode);

    return (
      <div className={'app-wrapper' + (darkMode ? ' dark-mode' : '')}>
        <header>
          <div className="header-content">
            <h1>Lambda Explorer</h1>
            <div className="header-settings" ref={r => this.settingsRef = r}>
              <span className='settings-gear' onClick={this._toggleSettings} title="Settings">
                {'⚙'}
              </span>
              {this.state.settingsOpen && (
                <div className='settings-popover'>
                  <label className='settings-label'>
                    Evaluation depth
                    <input
                      type='number'
                      className='settings-input'
                      value={this.state.evaluationDepth}
                      onChange={this._setEvaluationDepth}
                      min='1'
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="app-content">
          <article>
            <Repl
              ref={r => this.replRef = r}
              onCompute={this._handleOnCompute}
              onDefinitionsChange={this._handleDefinitionsChange}
              stringDefinitions={this.state.stringDefinitions}
              evaluationDepth={this.state.evaluationDepth}
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
              definitions={this.state.renderedDefinitions}
              collapsed={this.state.definitionsCollapsed}
              onToggle={this._toggleDefinitions}
              onInsert={this._handleInsertDefinition}
              onDelete={this._handleDeleteDefinition}
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
