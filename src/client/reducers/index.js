import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import login from './login/index';
import hospitals from './hospitals/index';

export default combineReducers({
  login,
  hospitals,
  routing: routerReducer
});
