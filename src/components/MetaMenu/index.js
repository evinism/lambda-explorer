import React from 'react';
import {renderExpression} from '../../lib/lambda'

class MetaMenu extends React.Component {
    state = {
        isExpanded: false,
    }
    
    toggleExpanded = () => {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }

    render() {
        const classname = 'meta-menu-expander' + (this.state.isExpanded ? ' expanded' : '');
        // AKA breaking the model horribly
        const definedVariables = this 
            .props
            .lambdaActor
            .executionContext
            .definedVariables;

        const kvEntries = Object
            .entries(definedVariables)
            .map(([varName, expr]) => (
                <div>
                    {varName}: {renderExpression(expr)}
                </div>
            ));

        return (
            <div className={classname} >
                <div className="meta-menu">
                    Menu items!!
                    {kvEntries}
                </div>
                <button
                    className="expand-meta-menu"
                    onClick={this.toggleExpanded}>
                    Definitions
                </button>
            </div>
        );
    }
}

export default MetaMenu;