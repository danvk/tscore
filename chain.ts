/**
 * Implementation of underscore/lodash-style chains in TypeScript.
 */

import * as lodash from 'lodash';

interface Action {
  func: (...args: any[]) => any;
  args: IArguments;
}

abstract class Chainable<T> {
  abstract value(): T;

  map<U>(func: (t: T) => U) {
    return new Op(func, this);
  }

  // XXX how to only expose this when T is really T[]?
  sort() {
    return new Op<T, T>(xs => lodash.sortBy(xs), this);
  }
}

class Value<T> extends Chainable<T> {
  constructor(private wrapped: T) {
    super();
  }

  value() {
    return this.wrapped;
  }
}

class Op<U, V> extends Chainable<V> {
  constructor(private op: (u: U) => V, private wrapped: Chainable<U>) {
    super();
  }

  value() {
    return this.op(this.wrapped.value());
  }
}

function _<T>(t: T): Chainable<T> {
  return new Value(t);
}

