import React from 'react';
import LoginComponent from '../components/index';
import { signInRequest } from '../../../actionCreators/Login';


class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
  }

  signIn = (login, password, rememberMe) => {
    signInRequest(login, password, rememberMe)
      .catch((errors) => {
        /* */
        this.setState({ errors });
      });
  };

  render() {
    return (<LoginComponent errors={this.state.errors} signIn={this.signIn} />);
  }
}

export default LoginContainer;
