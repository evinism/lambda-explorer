import React from 'react';
import {mapObjIndexed as rMap, compose as rCompose, values as rValues} from 'ramda';

const replacementMapping = {
  0: '₀',
  1: '₁',
  2: '₂',
  3: '₃',
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
  'L': 'λ',
};

const replaceAll = str => str.split('').map(
  letter => (replacementMapping[letter] || letter)
).join('');

export default class LambdaInput extends React.Component {
  state = {text: ''};

  _handleChange = (e) => {
    const text = replaceAll(e.target.value);
    this.setState({
      text,
      selStart: e.target.selectionStart,
      selEnd: e.target.selectionEnd,
    });
    if (this.props.onChange) {
      this.props.onChange(text);
    }
  };

  _handleKeyPress = (e) => {
    if(e.key == 'Enter'){
      this.props.submit && this.props.submit();
    }
  }

  componentDidUpdate(){
    this.refs.input.selectionStart = this.state.selStart;
    this.refs.input.selectionEnd = this.state.selEnd;
  }

  render(){
    // is very controllable yes!!!
    const value = this.props.value !== undefined
      ? this.props.value
      : this.state.text;
    return (
      <input
        className={this.props.className}
        autoFocus={this.props.autoFocus}
        onChange={this._handleChange}
        onKeyPress={this._handleKeyPress}
        value={value}
        ref='input'
      />
    )
  }
}
