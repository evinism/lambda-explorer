import ExecutionContextWorker from 'worker-loader!./worker.js';

// a lite wrapper around the executionContext, with time limits hopefully imposed
// termination should be necessary or something.
export default class LambdaActor {
  constructor(){
    this.executionContextWorker = new ExecutionContextWorker();
    this.executionContextWorker.onmessage = this._postBack;
  }

  send = (text) => {
    this.executionContextWorker.postMessage(text);
  }

  _postBack = (e) => {
    this.receive(JSON.parse(e.data));
  };

  definedVariables = () => {
    // TODO: Make this better
    return [];
  }

  // to be overwritten
  receive = () => {};
}
