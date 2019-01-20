import React from 'react';

export default class Button extends React.Component {
  handleClick = (e) => {
    e.preventDefault();
    const { onClick } = this.props;
    onClick(e);
  };

  render() {
    const { children, onClick, ...others } = this.props;
    return (
      <button type="button" onClick={this.handleClick} {...others}>
        {children}
      </button>
    );
  }
}
