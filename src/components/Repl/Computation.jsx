import React from 'react';
import Metadata from './LambdaMetadata';

export default class Computation extends React.Component {
  state = { expanded: false };

  handleButtonClick = (e) => {
    this.setState({
      expanded: !this.state.expanded,
    });
    e.preventDefault();
    e.stopPropagation();
  }

  render(){
    const {
      normAsNumeral,
      normAsBoolean,
      normalForm,
    } = this.props.computation;

    let addlInfo = [];
    addlInfo.push(normalForm.type);
    (normAsNumeral !== undefined) && addlInfo.push(`church numeral ${normAsNumeral}`);
    (normAsBoolean !== undefined) && addlInfo.push(`church boolean ${normAsBoolean}`);
    const addlInfoString = addlInfo.join(', ');

    const renderedAddlInfo = addlInfoString && ` <${addlInfoString}>`;

    return (
      <div className='result'>
        <div className="result-inner">
          <span title={this.props.children}>{this.props.children}</span>
          <div>
            <i>{renderedAddlInfo}</i>
            <span onClick={this.handleButtonClick} className='expand-collapse-button'>
              {this.state.expanded ? '(-)' : '(+)'}
            </span>
          </div>
        </div>
        {this.state.expanded && <Metadata ast={this.props.computation.ast} />}
      </div>
    );
  }
}
