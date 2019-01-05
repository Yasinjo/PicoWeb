import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


import Login from './tabs/login';
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
      // return <HospitalsTab />;
      return <div>HospitalsTab</div>;
    }

    if (getTokenFromStorage() && !this.state.tokenVerified) {
      // return <ProgressBar />;
      return <div>ProgressBar</div>;
    }


    return <Login />;
  }
}

AppCompoenent.defaultProps = {
  connected: false
};

AppCompoenent.propTypes = {
  updateConnection: PropTypes.func.isRequired,
  connected: PropTypes.bool
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppCompoenent);
