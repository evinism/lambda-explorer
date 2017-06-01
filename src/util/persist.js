// Persistent hack, certainly not excellent code, for singletons only
// plz don't think i like this.

// Put a persist(localKey, readFn, writeFn) wherever you want to persist across sessions
export default function persist(localKey, readFn, writeFn){
  const nopersist = (window.location.search === '?nopersist');
  if (!nopersist){
    const prevState = JSON.parse(localStorage.getItem(localKey));
    writeFn(prevState);
    window.addEventListener('beforeunload', () => {
      localStorage.setItem(localKey, JSON.stringify(readFn()));
    });
  } else {
    localStorage.removeItem(localKey);
  }
}
