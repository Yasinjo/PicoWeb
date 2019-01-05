import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import login from './login/index';

export default combineReducers({
  login,
  routing: routerReducer
});
