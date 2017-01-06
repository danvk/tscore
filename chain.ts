/**
 * Implementation of underscore/lodash-style chains in TypeScript.
 */

interface Action {
  func: (...args: any[]) => any;
  args: IArguments;
}

class Wrapped<First, T> {
  private actions: Action[] = [];
  constructor(private wrapped: First) {}

  map(func: T => U): Wrapped<First, U> {
    this.actions.push({func, args: []});
    return this;
  }
}

function _<T>(t: T): Wrapped<T> {
  return new Wrapped(t);
}
