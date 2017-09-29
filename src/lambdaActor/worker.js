import ExecutionContext from './executionContext';

const executionContext = new ExecutionContext();

onmessage = function(e) {
  const text = e.data;
  const computation = executionContext.evaluate(text);
  postMessage(JSON.stringify(computation));
}
