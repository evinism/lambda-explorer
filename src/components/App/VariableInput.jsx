import React from 'react';
import LambdaInput from '../LambdaInput';

export default class VariableInput extends React.Component {
  state = ({text: ''});

  _onChange = (text) => {
    this.setState({text});
  }

  _onClick = () => {
    if(!/^[a-zA-Z][₀-₉]*$/.test(this.state.text)){
      alert('nope that is of bad form');
      return;
    }
    console.log('Defining this: ' + this.state.text);
    this.props.defineVariable(this.state.text);
  }

  render(){
    return(
      <div className="variable-form">
        <LambdaInput onChange={this._onChange} value={this.state.text} />
        <input type="button" onClick={this._onClick} value="Define that thing" />
      </div>
    );
  }
}
