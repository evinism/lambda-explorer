import React from 'react';
import LambdaInput from '../LambdaInput';


// map shift-L to lambda!
class App extends React.Component {
  render() {
    return(
      <article>
        <h1>Application</h1>
        <LambdaInput />
      </article>
    );
  }
}

export default App;
