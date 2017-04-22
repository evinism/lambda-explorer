import React from 'react';
import LambdaInput from '../LambdaInput';
import LambdaMetadata from '../LambdaMetadata';

import {tokenize} from '../../lib/lambda/lexer';

class App extends React.Component {
  state = {text: '', lexerText: ''};

  handleInputChange = (text) => {
    this.setState({text})
  }

  handleLexerInputChange = (e) => {
    const text = e.target.value;
    this.setState({lexerText: text});
  }

  render() {
    let lexerOutput;
    try {
      lexerOutput = JSON.stringify(tokenize(this.state.lexerText));
    } catch(err) {
      lexerOutput = (<span>{err}</span>);
    }

    return (
      <article>
        <input onChange={this.handleLexerInputChange} value={this.state.lexerText} />
        <div>{lexerOutput}</div>
      </article>
    );

    return (
      <article>
        <h1>Lambda Explorer</h1>
        <h3>shift-L to type λ, rigorous syntax only plz</h3>

        <hr />
        <LambdaInput onChange={this.handleInputChange} />
        <LambdaMetadata text={this.state.text} />
      </article>
    );
  }
}

export default App;
