export default class TimeoutWatcher {
  constructor(WorkerClass, timeout = 5000){
    this.WorkerClass = WorkerClass;
    this.timeout = timeout;
  }

  _postBack = (msg) => {
    this.receive(msg);
  }

  send = (msg) => {
    const workerInst = new this.WorkerClass();
    const watchdog = setTimeout(() => {
      workerInst.terminate();
      this._postBack({
        type: 'error',
        error: { message: 'Runtime Error: Timeout exceeded' },
        text: msg.text,
        ast: msg.ast,
      });
    }, this.timeout);
    workerInst.postMessage(JSON.stringify(msg));
    workerInst.onmessage = e => {
      clearTimeout(watchdog);
      this._postBack(JSON.parse(e.data));
      workerInst.terminate();
    }
  };

  receive = () => {};
}
