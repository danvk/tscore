import * as chai from 'chai';
import * as _ from 'lodash';

const { expect } = chai;

function expectDeepEqual<T>(a: T, b: T) {
  expect(a).to.deep.equal(b);
}

describe('chains', () => {
  it('should chain map', () => {
    expectDeepEqual(
      _([1, 2, 3]).map(x => x * x).value(),
      [1, 4, 9]
    );
  });

  it('should chain map/uniq', () => {
    expectDeepEqual(
      _([1, 2, 3, 2]).map(x => x * x).uniq().value(),
      [1, 4, 9]
    );
  });

  it('should chain objects', () => {
    expectDeepEqual(
      _({a: 1, b: 2, c: 3})
        .mapValues(x => x * x)
        .value(),
      {a: 1, b: 4, c: 9}
    );
  });

  it('should pluck with map', () => {
    expectDeepEqual(
      _([{a: 2, b: 2}, {a: 2, b: 3}, {a: 1, b: 4}])
        .map('a')
        .sort()
        .uniq()
        .value(),
      [1, 2]
    );
  });

  it('should map to an array of objects', () => {
    expectDeepEqual(
      _([1, 2, 3])
        .map(x => ({num: x, sqr: x * x, str: '' + x}))
        .map('str')
        .value(),
      ['1', '2', '3']);

    expectDeepEqual(
      _([1, 2, 3])
        .map(x => ({num: x, sqr: x * x, str: '' + x}))
        .map('sqr')
        .value(),
      [1, 4, 9]);
  });

  it('should auto-close chains', () => {
    const v = _([1, 2, 3]).map(x => x*x).sum();
    const w = _([1, 2, 3]).map(x => '' + x).sum();
  });

  it('distinguishes flatMaps', () => {
    expectDeepEqual(
      _([1, 2, 3, 4])
        .flatMap((v, i) => i % 2 === 0 ? [v] : [v, v * v])
        .value(),
      [1, 2, 4, 3, 4, 16]
    );

    expectDeepEqual(
      _({x: 1, y: 2, z: 3})
        .flatMap((v, k) => (k === 'z' ? [v] : [v, v * v]))
        .value(),
      [1, 1, 2, 4, 3]
    );
  });
});
