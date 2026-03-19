import ExecutionContext from "./executionContext.js";

// a lite wrapper around the executionContext, with time limits hopefully imposed
// termination should be necessary or something.
export default class LambdaActor {
  constructor() {
    this.executionContext = new ExecutionContext();
  }

  setMaxDepth = (depth) => {
    this.executionContext.maxDepth = depth;
  };

  setEtaReduce = (etaReduce) => {
    this.executionContext.etaReduce = etaReduce;
  };

  send = (text) => {
    return Promise.resolve(this.executionContext.send(text));
  };
}
