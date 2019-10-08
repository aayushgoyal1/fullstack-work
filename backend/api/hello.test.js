const hello = require('./hello');
test('sends hello world', () => {
  const mockSend = jest.fn(msg => msg);
  hello(null, { send: mockSend });
  expect(mockSend).toHaveBeenCalledWith('Hello, World!');
});
