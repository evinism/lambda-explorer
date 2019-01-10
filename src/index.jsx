import React from 'react';
import ReactDOM from 'react-dom';
import generateGoldens from './util/generateGoldens';

window.generateGoldens = generateGoldens;

import App from './components/App';

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<App />, document.getElementById('react-mount'));
});
