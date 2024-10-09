// should be moved back probs.
import astToMetadata from "./astToMetadata.js";

onmessage = function(e) {
  const { ast, text } = JSON.parse(e.data);
  let metadata;
  try {
    metadata = astToMetadata(ast);
    postMessage(JSON.stringify({
      type: 'computation',
      text,
      ast,
      ...metadata
    }));
  } catch(err) {
    if (err instanceof Error) {
      // json serialized errors are fun.
      err = { message: err.toString() };
    }
    postMessage(JSON.stringify({
      type: 'error',
      error: err,
      text,
      ast,
    }))
  }
}
