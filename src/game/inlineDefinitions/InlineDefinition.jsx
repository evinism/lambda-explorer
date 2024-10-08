import React from 'react';
import ReactjsPopup from 'reactjs-popup';
import definitions from "./definitions.js";


export default ({entry, children}) => {
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
