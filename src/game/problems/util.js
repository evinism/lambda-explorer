import React from 'react';
import ReactjsPopup from 'reactjs-popup';
import {equal} from '../../lib/lambda';


export const safeEqual = (a, b) => (a && b) ? equal(a, b) : false;

// (ast, [[arg, arg, result]])  => bool
// should be able to handle non-boolean arguments too...
export function satisfiesTruthTable(ast, rules){
  return rules.map(
    rule => {
      const mutable = [].concat(rule);
      const target = mutable.pop();
      const ruleArgs = mutable;

      const testAst = ruleArgs.reduce((acc, cur) => ({
        type: 'application',
        left: acc,
        right: cur,
      }), ast);

      try {
        const res = equal(target, toNormalForm(testAst));
        return res;
      } catch (e) {
        console.log("Error in test: " + e);
        return false;
      }
    }
  ).reduce((a, b) => a && b, true);
};



export const Code = props => (<span className="code">{props.children}</span>);

export const makeDef = definitions =>  ({e: entry, children}) => {
  if (window.location.search !== '?inlinedefs') {
    return children;
  }
  return (
    <ReactjsPopup
      trigger={<span className="inline-definition">{children}</span>}
      position="left center"
      on="hover"
    >
      {console.log(definitions, entry)}
      {definitions[entry] || (<h2>No definition found!!!</h2>)}
    </ReactjsPopup>
  );
}

