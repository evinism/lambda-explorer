import React from 'react';

export default ({problems, current}) => {
  const prev = problems[current - 1];
  const problem = problems[current];
  const next = problems[current + 1];

  const formatted = (num, item) => `${num}. ${item.title}`

  return (
    <div>
      <div>
        {prev && formatted(current, prev)}<br />
        <b>{formatted(current + 1, problem)}</b><br />
        {next && formatted(current + 2, next)}
      </div>
      <h3>Problem {current + 1}: {problem.title}</h3>
      {problem.prompt}
    </div>
  )
};
