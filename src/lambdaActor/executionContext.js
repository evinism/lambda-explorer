// might be cool to do this within lib/lambda.
// import MetadataWorker from 'worker-loader?inline!./worker.js';
// import TimeoutWatcher from './TimeoutWatcher';
// stick these in on move to async interface.
import astToMetadata from './astToMetadata';
import { FreeVarInDefinitionError } from './errors';

import {
  parseExtendedSyntax,
  getFreeVars,
  replace,
  toNormalForm,
} from '../lib/lambda';

// There's a better way of doing this I swear.
// Might want to make a whole "Execution" object
class ExecutionContext {

  constructor(){
    this.definedVariables = {};
    // this.metadataWrapper = new TimeoutWatcher(MetadataWorker);
    // this.metadataWrapper.receive = msg => this._handleMetadataMessage(msg);
  }

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

  defineVariableFromString(name, string){
    const ast = parseTerm(string);
    this.defineVariable(name, ast);
  }

  // Defined variables must contain no unresolvableVariables
  // This is so that variable resolution is guaranteed to halt at some point.
  defineVariable(name, ast){
    if(this.getUnresolvableVariables(ast).length > 0){
      const unresolvables = this.getUnresolvableVariables(ast).join(', ');
      throw new FreeVarInDefinitionError('Name Error: Expression contains free variables ' + unresolvables + '. Assigned values cannot have free variables in this REPL.');
    }
    this.definedVariables[name] = ast;
  }

  clearVariables(){
    this.definedVariables = {};
  }

  // string => computationData
  // a computationData is loosely defined right now-- kind of a grab bag of an object.
  evaluate(text){
    let ast;
    try {
      // lambda + assignment
      ast = parseExtendedSyntax(text);
      if (ast.type === 'assignment') {
        const lhs = ast.lhs;
        ast = ast.rhs;
        ast = this.resolveVariables(ast);
        this.defineVariable(lhs, ast);
        // duped, but we can continue separating them.
        this._postBack({
          type: 'assignment',
          text,
          lhs,
          ast,
        });
      } else {
        ast = this.resolveVariables(ast);
        const metadata = astToMetadata(ast);
        this._postBack({
          type: 'computation',
          text,
          ast,
          ...metadata
        });
      }
    } catch(error){
      // we pass AST, executionContext because in the case that we parsed
      // successfully, we still want to be able to use it in win conditions

      // TODO: Make sure max call stack doesn't really happen, or is handled
      // This looks like: (λa.aa)(λa.aaa)
      this._postBack({
        type: 'error',
        error,
        text,
        ast,
      });
    }
  }

  _handleMetadataMessage(msg){
    this._postBack(msg);
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

  // should be replaced with a subscribe handler.
  receive = () => {};

  send = (text) => {
    this.evaluate(text);
  };

  _postBack = (msg) => {
    this.receive(msg);
  };
}

export default ExecutionContext;
