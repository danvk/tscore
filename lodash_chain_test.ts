import * as chai from 'chai';
import * as _ from 'lodash';

const { expect } = chai;

function expectDeepEqual(a, b) {
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
});
