const mongoMock = require('../mongo.mock');
const mustBeLoggedIn = require('./must-be-logged-in').withoutResponse;
test("stops people who aren't logged in", async () => {
  mongoMock(null);
  await expect(mustBeLoggedIn()).rejects.toBeInstanceOf(Error);
  await expect(mustBeLoggedIn({ cookies: {} })).rejects.toBeInstanceOf(Error);
  await expect(
    mustBeLoggedIn({ cookies: { id: null, sessionCookie: null } })
  ).rejects.toBeInstanceOf(Error);
  await expect(
    mustBeLoggedIn({ cookies: { id: '', sessionCookie: '' } })
  ).rejects.toBeInstanceOf(Error);
});
