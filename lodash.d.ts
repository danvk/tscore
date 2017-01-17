declare module 'lodash' {
  type Primitive = string | number | Date | RegExp;

  interface Chainable<T> {
    value(): T;
  }
  interface ChainableArray<T> extends Chainable<T[]> {
    map<U extends Primitive>(mapFn: (t: T) => U): ChainableArray<U>;
    map<U>(mapFn: (t: T) => U): ChainableObjectArray<U>;
    uniq(): ChainableArray<T>;
    sort(): ChainableArray<T>;
    sum(): T;  // XXX how to make this only valid for number, string?
    flatMap<U>(mapFn: (t: T, i: number, collection: T[]) => U[]): ChainableArray<U>;
    forEach(fn: (t: T, i: number, collection: T[]) => any): void;
    groupBy<U>(fn: (t: T, i: number) => U): ChainableObject<{U: T[]}>;
  }
  // XXX it would be nice to share code between Chainable(Array|Object).
  // Many of the methods are identical except for the key type.
  //   a complication is that keyof number[] is all the array methods.
  // XXX would also be nice to pull out a notion of "iteratee", which can be either a function or a key.
  interface ChainableObject<T> extends Chainable<T> {
    mapValues<K extends keyof T, V>(mapFn: (v: T[K], k: K) => V): ChainableObject<{[k in K]: V}>;
    flatMap<K extends keyof T, U>(mapFn: (t: T[K], k: K, collection: T) => U[]): ChainableArray<U>;
    forEach<K extends keyof T>(fn: (t: T[K], k: K, collection: T) => any): void;
  }
  interface ChainableObjectArray<T> extends ChainableArray<T> {
    map<K extends keyof T>(k: K): ChainableArray<T[K]>;
  }

  interface Lodash {
    <T extends Primitive>(t: T): Chainable<T>;
    <T extends Primitive>(t: T[]): ChainableArray<T>;
    <T>(t: T[]): ChainableObjectArray<T>;
    <T>(t: T): ChainableObject<T>;
  }

  const tmp: Lodash;
  export = tmp;
}
