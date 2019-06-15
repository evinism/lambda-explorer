import React from 'react';

export default ({problems, current, shown, handlePrevClick, handleNextClick}) => {
  const problem = problems[shown];

  const formatted = (num, item) => `${num}. ${item.title}`

  return (
    <div>
      <div className="problem-text">
        <h3>Problem {shown + 1}: {problem.title}</h3>
        {current !== shown && (<p className='solved-badge'>[solved]</p>)}
        {problem.prompt}
      </div>
      <div className="problem-navigator">
        <button 
          className={shown > 0 ? 'prev-problem' : 'prev-problem hidden'} 
          onClick={handlePrevClick}
        >
          ‹
        </button>
        {shown + 1} / {problems.length}
        <button
          className={shown < current ? 'next-problem' : 'next-problem hidden'} 
          onClick={handleNextClick}
        >
          ›
        </button>
      </div>
    </div>
  );
};
