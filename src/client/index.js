import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { TOKEN_LOCALSTORAGE_KEY } from '../../config/app_config.json';

localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzFmZDg3ZDVkMTU5NTExOTA1Yzg0NzYiLCJpYXQiOjE1NDU2NDc2MzV9.D6JEN-zmts46yOnP6N7Na8Bb0wrkzDxVgbuOt1avZ_8');

ReactDOM.render(<App />, document.getElementById('root'));
