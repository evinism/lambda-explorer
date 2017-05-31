import React from 'react';

export default ({problems, current, shown}) => {
  const prev = problems[current - 1];
  const problem = problems[shown];
  const next = problems[current + 1];

  const formatted = (num, item) => `${num}. ${item.title}`

  return (
    <div>
      <h3>Problem {shown + 1}: {problem.title}</h3>
      {current !== shown && (<p className='solved-badge'>[solved]</p>)}
      {problem.prompt}
    </div>
  )
};
