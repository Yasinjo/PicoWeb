import React from 'react';
import PropTypes from 'prop-types';
import { REQUIRED_FIELD } from '../../../constants.json';

function createErrorAlert(message) {
  return (
    <div className="form-group">
      <div className="alert alert-danger">
        {message}
      </div>
    </div>
  );
}

export default class LoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      login: '',
      password: '',
      rememberMe: ''
    };
  }

  setErrors = (errors) => {
    console.log('setErrors invoked');
    console.log(errors);
    console.log(this);
    this.setState({ errors });
  };

  signIn = () => {
    const { login, password, rememberMe } = this.state;
    const errors = {};
    if (!login.trim().length) {
      errors.login = REQUIRED_FIELD;
      return this.setErrors(errors);
    }

    if (!password.trim().length) {
      errors.password = REQUIRED_FIELD;
      return this.setErrors(errors);
    }

    return this.props.signIn(login, password, rememberMe, this.setErrors);
  }

  updateLogin = (event) => {
    this.setState({
      login: event.target.value
    });
  }

  updatePassword = (event) => {
    this.setState({
      password: event.target.value
    });
  }

  updateRememberMe = (event) => {
    this.setState({
      rememberMe: event.target.checked
    });
  }

  render() {
    const { errors } = this.state;
    return (
      <React.Fragment>
        <div
          className="text-center"
          style={{ padding: '90px 0 30px 0', background: '#fff', borderBottom: '1px solid #ddd' }}
        >
          <img src="img/logo-big.svg" width="300" height="45" alt="" />
        </div>

        <div
          className="col-sm-6 col-md-4 col-lg-3"
          style={{ margin: '40px auto', float: 'none' }}
        >
          <div className="col-xs-12">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-addon">
                  <i className="fa fa-fw fa-user" />
                </div>
                <input
                  type="text"
                  name="login"
                  className="form-control"
                  placeholder="Login ::"
                  value={this.login}
                  onChange={this.updateLogin}
                />
              </div>
            </div>

            {errors.login && createErrorAlert(errors.login)}

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-addon">
                  <i className="fa fa-fw fa-lock" />
                </div>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  onChange={this.updatePassword}
                  value={this.password}
                />
              </div>
            </div>

            {errors.password && createErrorAlert(errors.password)}
          </div>
          <div className="col-xs-6">
            <div className="checkbox">
              <label>
                <input type="checkbox" checked={this.rememberMe} onChange={this.updateRememberMe} />
                {'Remember me'}
              </label>
            </div>
          </div>
          <div className="col-xs-6">
            <button type="submit" className="btn btn-block btn-primary" onClick={this.signIn}> Sign in </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}


LoginComponent.propTypes = {
  signIn: PropTypes.func.isRequired
};
