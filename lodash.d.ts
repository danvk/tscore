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
  }
  interface ChainableObject<T> extends Chainable<T> {
    mapValues<K extends keyof T, V>(mapFn: (v: T[K], k: K) => V): ChainableObject<{[k in K]: V}>;
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
