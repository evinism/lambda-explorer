import React from 'react';

export default class Error extends React.Component {
  state = { expanded: false };

  handleButtonClick = (e) => {
    this.setState({
      expanded: !this.state.expanded,
    });
    e.preventDefault();
    e.stopPropagation();
  }

  render(){
    const {ast} = this.props;
    return (
      <span className='result'>
        <div>
          <div className="result-inner">
            <span>{this.props.children}</span>
            <div><i>{` <assignment>`}</i></div>
          </div>
        </div>
      </span>
    );
  }
}
