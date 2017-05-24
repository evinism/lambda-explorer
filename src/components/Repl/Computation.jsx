import React from 'react';
import Metadata from '../App/LambdaMetadata';

export default class Computation extends React.Component {
  state = { expanded: false };

  handleButtonClick = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
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
      <div>
        <div className="result-inner">
          <span>{this.props.children}</span>
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
