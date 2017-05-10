import React from 'react';

export default ({problems, current}) => (
  <div>
    <h3>Problem {current + 1}</h3>
    <p>{problems[current].prompt}</p>
    <ol>
      {problems.map((problem, index) => (
        <li
          key={index}
          className={index === current ? 'highlighted': ''}
        >
          {problem.title}
        </li>
      ))}
    </ol>
  </div>
);
