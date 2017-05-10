// might be cool to do this within lib/lambda.
import {
  parseTerm,
  getFreeVars,
  replace,
  toNormalForm,
} from '../lib/lambda';

import astToMetadata from './astToMetadata';

// There's a better way of doing this I swear.
// Might want to make a whole "Execution" object
class ExecutionContext {
  definedVariables = {};

  getResolvableVariables(ast){
    // holy fuck there is so much badness in here.
    return getFreeVars(ast).map(token => token.name).filter(
      name => this.definedVariables[name] !== undefined
    );
  }

  getUnresolvableVariables(ast){
    return getFreeVars(ast).map(token => token.name).filter(
      name => this.definedVariables[name] === undefined
    )
  }

  // Defined variables must contain no unresolvableVariables
  // This is so that variable resolution is guaranteed to halt at some point.
  defineVariable(name, string){
    if(this.definedVariables[name]){
      throw 'nope, that is already defined';
    }
    const ast = parseTerm(string);
    if(this.getUnresolvableVariables(ast).length > 0){
      const unresolvables = this.getUnresolvableVariables(ast).join(', ');
      throw 'nope, you got unresolvables ' + unresolvables + '. eradicate those.'
    }
    this.definedVariables[name] = ast;
  }

  clearVariables(){
    this.definedVariables = {};
  }

  // string => computationData
  evaluate(string){
    let ast, metadata;
    try {
      let ast = parseTerm(string);
      ast = this.resolveVariables(ast);
      metadata = astToMetadata(ast);
    } catch(error){
      return { error }
    }
    return metadata;
  }

  // This does the same thing as evaluate, except spawns off a webworker to do so.
  evaluateAsync(){

  }

  // ast => ast
  resolveVariables(ast){
    let currentAst = ast;
    // this could be much faster. Let's do clever stuff after this works.
    let resolvableVars = this.getResolvableVariables(ast);
    while(resolvableVars.length > 0){
      const toResolve = resolvableVars[0];
      currentAst = replace(
        toResolve,
        this.definedVariables[toResolve],
        currentAst
      );
      resolvableVars = this.getResolvableVariables(currentAst);
    }
    return currentAst;
  }
}

export default ExecutionContext;