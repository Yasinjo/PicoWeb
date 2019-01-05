import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { fetchHospitals } from './actionCreators/Hospitals';

import rootReducer from './reducers/index';
import App from './App';

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunkMiddleware))
);

function initData() {
  fetchHospitals(store.dispatch);
}

function Main() {
  return (
    <Provider store={store}>
      <App init={initData} />
    </Provider>
  );
}

ReactDOM.render(<Main />, document.getElementById('root'));
