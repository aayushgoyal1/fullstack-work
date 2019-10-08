const usage = require('./usage');
test('able to find usage without errors', async () => {
  const mockSend = jest.fn(msg => msg);
  await usage(null, { json: mockSend });
  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockSend).toHaveBeenCalledWith(expect.any(Number));
});
