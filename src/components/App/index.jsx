import React from 'react';
import LambdaInput from '../LambdaInput';
import LambdaMetadata from '../LambdaMetadata';

import {tokenize} from '../../lib/lambda/lexer';

class App extends React.Component {
  state = {text: ''};

  handleInputChange = (text) => {
    this.setState({text})
  }

  render() {
    return (
      <article>
        <h1>Lambda Explorer</h1>
        <h3>shift-L to type λ, rigorous syntax only plz</h3>
        <LambdaInput onChange={this.handleInputChange} />
        <LambdaMetadata text={this.state.text} />
      </article>
    );
  }
}

export default App;
