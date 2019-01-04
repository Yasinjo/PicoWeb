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
    this.state = { errors: props.errors || {} };
    this.login = React.createRef();
    this.password = React.createRef();
    this.rememberMe = React.createRef();
  }

  signIn = () => {
    const login = this.login.current;
    const password = this.password.current;
    const rememberMe = this.rememberMe.current;
    const errors = {};
    if (!login.value || !login.value.trim().length) {
      errors.login = REQUIRED_FIELD;
      return this.setState({ errors });
    }

    if (!password.value || !password.value.trim().length) {
      errors.password = REQUIRED_FIELD;
      return this.setState({ errors });
    }

    return this.props.signIn(login.value, password.value, rememberMe.checked);
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
                  placeholder="Login"
                  ref={this.login}
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
                  ref={this.password}
                />
              </div>
            </div>

            {errors.password && createErrorAlert(errors.password)}
          </div>
          <div className="col-xs-6">
            <div className="checkbox">
              <label>
                <input type="checkbox" ref={this.rememberMe} />
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
LoginComponent.defaultProps = {
  errors: {}
};

LoginComponent.propTypes = {
  signIn: PropTypes.func.isRequired,
  errors: PropTypes.shape({ login: PropTypes.string, password: PropTypes.string })
};
