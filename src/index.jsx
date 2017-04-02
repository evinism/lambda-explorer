import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import App from './components/App';

$(document).ready(() => {
  ReactDOM.render(<App />, $('#react-mount')[0]);
});
