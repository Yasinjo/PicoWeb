import { connect } from 'react-redux';
import LoginComponent from '../components/index';
import addTokenToStorage from '../../../helpers/addTokenToStorage';
import { signInRequest, partnerIsConnected } from '../../../actionCreators/Login';

const mapDispatchToProps = dispatch => ({
  signIn: (login, password, rememberMe, setErrors) => {
    signInRequest(login, password, rememberMe)
      .then((token) => {
        addTokenToStorage(token, rememberMe);
        partnerIsConnected(true, dispatch);
      })
      .catch(errors => setErrors(errors));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(LoginComponent);
