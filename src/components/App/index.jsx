import React from 'react';
import LambdaInput from '../LambdaInput';


// map shift-L to lambda!
class App extends React.Component {
  render() {
    return(
      <article>
        <h1>Lambda Explorer</h1>
        <h3>shift-L to type λ, rigorous syntax only plz</h3>
        <LambdaInput />
      </article>
    );
  }
}

export default App;
