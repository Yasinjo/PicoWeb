import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Login from './tabs/login';
import LineProgressBar from './shared/LineProgressBar';
import MainMenu from './shared/MainMenu';
import getTokenFromStorage from './helpers/getTokenFromStorage';
import removeTokenFromStorage from './helpers/removeTokenFromStorage';
import verifyToken from './helpers/verifyToken';
import { partnerIsConnected } from './actionCreators/Login';

const mapDispatchToProps = dispatch => ({
  updateConnection: connected => partnerIsConnected(connected, dispatch)
});

const mapStateToProps = state => ({
  connected: state.login.connected
});

class AppCompoenent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tokenVerified: false };
  }

  componentDidMount() {
    if (!this.props.connected) {
      const token = getTokenFromStorage();
      if (token) {
        verifyToken(token)
          .then(() => {
            this.props.updateConnection(true);
          })
          .catch(() => {
            removeTokenFromStorage();
            this.setState({ tokenVerified: true });
          });
      }
    }
  }

  render() {
    if (this.props.connected) {
      return <MainMenu init={this.props.init} updateConnection={this.props.updateConnection} />;
    }

    if (getTokenFromStorage() && !this.state.tokenVerified) {
      return <LineProgressBar />;
    }


    return <Login />;
  }
}

AppCompoenent.defaultProps = {
  connected: false
};

AppCompoenent.propTypes = {
  updateConnection: PropTypes.func.isRequired,
  init: PropTypes.func.isRequired,
  connected: PropTypes.bool
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppCompoenent);
