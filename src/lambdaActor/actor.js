import ExecutionContext from './executionContext';

// a lite wrapper around the executionContext, with time limits hopefully imposed
// termination should be necessary or something.
export default class LambdaActor {
  constructor(){
    this.executionContext = new ExecutionContext();
    this.executionContext.receive = this._postBack;
  }

  send = (text) => {
    this.executionContext.send(text);
  }

  _postBack = (msg) => {
    this.receive(msg);
  };

  // to be overwritten
  receive = () => {};
}
