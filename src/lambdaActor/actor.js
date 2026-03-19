import ExecutionContext from "./executionContext.js";

// a lite wrapper around the executionContext, with time limits hopefully imposed
// termination should be necessary or something.
export default class LambdaActor {
  constructor() {
    this.executionContext = new ExecutionContext();
  }

  send = (text) => {
    return Promise.resolve(this.executionContext.send(text));
  };
}
