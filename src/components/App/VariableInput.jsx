import React from 'react';
import LambdaInput from '../LambdaInput';

export default class VariableInput extends React.Component {
  state = ({text: ''});

  _onChange = (text) => {
    this.setState({text});
  }

  _onClick = () => {

    console.log('Defining this: ' + this.state.text);
    this.props.defineVariable(this.state.text);
  }

  render(){
    return(
      <div className="variable-form">
        <LambdaInput onChange={this._onChange} />
        <input type="button" onClick={this._onClick} value="Define that thing" />
      </div>
    );
  }
}
