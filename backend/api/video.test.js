const { nameVideosInOrder } = require('./video');
test('video are named properly', async () => {
  expect(nameVideosInOrder([])).toEqual([]);
  expect(nameVideosInOrder([{}])).toEqual([{ name: 'Recording 1' }]);
  expect(
    nameVideosInOrder([{ foo: 'bar' }, { baz: 'quux' }, { quuz: 'foo' }])
  ).toEqual([
    { name: 'Recording 1', foo: 'bar' },
    { name: 'Recording 2', baz: 'quux' },
    { name: 'Recording 3', quuz: 'foo' }
  ]);
});
