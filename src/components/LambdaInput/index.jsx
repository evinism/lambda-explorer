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


const replaceAll = rCompose(
  ...rValues(
    rMap(
      (val, key) => str => str.replace(new RegExp(key, 'g'), val),
      replacementMapping
    )
  )
);


const replaceAll2 = str => str.split('').map(
  letter => (replacementMapping[letter] || letter)
).join('');

window.replaceAll = replaceAll;
window.replaceAll2 = replaceAll2;




export default class LambdaInput extends React.Component {
  state = {text: ''};

  handleChange = (e) => {
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
