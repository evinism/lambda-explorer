import React from 'react';

export default class LambdaInput extends React.Component {
  state = {text: ''};

  handleChange = (e) => {
    const text = e.target.value.replace(/L/g, 'λ');
    this.setState({
      text,
      selStart: e.target.selectionStart,
      selEnd: e.target.selectionEnd,
    });
    if (this.props.onChange) {
      this.props.onChange(text);
    }
  };

  componentDidUpdate(){
    this.refs.input.selectionStart = this.state.selStart;
    this.refs.input.selectionEnd = this.state.selEnd;
  }

  render(){
    return (
      <div className="lambda-holder">
        <input className="lambda-input" autoFocus onChange={this.handleChange} value={this.state.text} ref='input' />
      </div>
    )
  }
}
