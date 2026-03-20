import React from 'react';
import ReactjsPopup from 'reactjs-popup';
import definitions from "./definitions.js";


export default ({entry, children}) => {
  return (
    <ReactjsPopup
      trigger={<span className="inline-definition">{children}</span>}
      position="left center"
      on="hover"
    >
      <div className="inline-definitions-popup">
        {definitions[entry] || <h2>No definition found!!!</h2>}
      </div>
    </ReactjsPopup>
  );
}
