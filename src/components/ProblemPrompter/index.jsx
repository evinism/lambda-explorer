import React from 'react';

export default ({problems, current}) => (
  <div>
    <h3>Problem {problems[current].number}</h3>
    <p>{problems[current].prompt}</p>
  </div>
);
