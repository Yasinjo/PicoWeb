import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import login from './login/index';
import hospitals from './hospitals/index';
import allHospitals from './allHospitals/index';
import ambulances from './ambulances/index';
import drivers from './drivers/index';

export default combineReducers({
  login,
  hospitals,
  ambulances,
  drivers,
  allHospitals,
  routing: routerReducer
});
