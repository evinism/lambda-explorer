import React from 'react';

const DefinitionsExplorer = ({ definitions, collapsed, onToggle, onInsert, onDelete }) => {
  const count = definitions.length;

  return (
    <div className="definitions-explorer">
      <h3
        className="definitions-header"
        onClick={onToggle}
      >
        <span className="definitions-toggle">{collapsed ? '▸' : '▾'}</span>
        {' '}Definitions ({count})
      </h3>
      {!collapsed && (
        <div className="definitions-list">
          {count === 0 && (
            <p className="definitions-empty">No definitions yet. Use <span className="code">NAME := expr</span> to define.</p>
          )}
          {definitions.map(({ name, expression, churchNumeral, churchBoolean }) => {
            let annotation = [];
            if (churchNumeral !== undefined) annotation.push(churchNumeral);
            if (churchBoolean !== undefined) annotation.push(churchBoolean);
            const annotationStr = annotation.join(', ');

            return (
              <div key={name} className="definition-entry">
                <span
                  className="definition-delete"
                  onClick={() => onDelete && onDelete(name)}
                >x</span>
                <span
                  className="definition-name"
                  onClick={() => onInsert && onInsert(name)}
                >{name}</span>
                {' := '}
                <span className="definition-expression">{expression}</span>
                {annotationStr && (
                  <span className="definition-annotation"> ({annotationStr})</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DefinitionsExplorer;
