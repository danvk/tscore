// $ExpectType boolean[]
_.find([1, 2, 3], x => x * 1 == 3);
// $ExpectError number cannot be compared to string
_.find([1, 2, 3], x => x == 'a');
// $ExpectError number. This type is incompatible with function type.
_.find([1, 2, 3], 1);
// $ExpectError property `y`. Property not found in object literal
_.find([{x:1}, {x:2}, {x:3}], v => v.y == 3);
// $ExpectType boolean[]
_.find([{x:1}, {x:2}, {x:3}], v => v.x == 3);
