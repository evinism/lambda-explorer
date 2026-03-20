import React from 'react';
import { createRoot } from 'react-dom/client';
import generateGoldens from './util/generateGoldens';

window.generateGoldens = generateGoldens;

import App from './components/App';

document.addEventListener("DOMContentLoaded", () => {
  createRoot(document.getElementById('react-mount')).render(<App />);
});
