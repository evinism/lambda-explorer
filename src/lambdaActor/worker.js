// should be moved back probs.
import astToMetadata from '../util/astToMetadata';

onmessage = function(e) {
  const { ast, text, } = JSON.parse(e.data);
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
    postMessage(JSON.stringify({
      type: 'error',
      error: err,
      text,
      ast,
    }))
  }
}
