import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import login from './login/index';
import hospitals from './hospitals/index';
import ambulances from './ambulances/index';

export default combineReducers({
  login,
  hospitals,
  ambulances,
  routing: routerReducer
});
