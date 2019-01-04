import React from 'react';
import Login from './tabs/login';
import getTokenFromStorage from './helpers/getTokenFromStorage';
import removeTokenFromStorage from './helpers/removeTokenFromStorage';
import verifyToken from './helpers/verifyToken';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tokenVerified: false, connected: false };
  }

  componentDidMount() {
    const token = getTokenFromStorage();
    if (token && !this.state.connected) {
      verifyToken(token)
        .then(() => this.setState({ connected: true }))
        .catch(() => {
          removeTokenFromStorage();
          this.setState({ tokenVerified: true, connected: false });
        });
    }
  }


  render() {
    if (getTokenFromStorage()) {
      if (this.state.connected) {
        // return <HospitalsTab />;
        return <div>HospitalsTab</div>;
      }
      if (!this.state.tokenVerified) {
        // return <ProgressBar />;
        return <div>ProgressBar</div>;
      }
    }

    return <Login />;
  }
}
