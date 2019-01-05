import { Line } from 'rc-progress';
import React from 'react';

export default class LineProgressBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { progress: 0 };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const { progress } = this.state;
      const newProgress = progress < 100 ? progress + 1 : 100;
      this.setState({ progress: newProgress });
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <React.Fragment>
        <h3>Loading {this.state.progress}%</h3>
        <Line percent={this.state.progress} strokeWidth="1" strokeColor="#3FC7FA" />
      </React.Fragment>
    );
  }
}
