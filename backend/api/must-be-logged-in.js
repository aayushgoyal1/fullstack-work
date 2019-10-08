module.exports = async (req, res, next) => {
  try {
    await module.exports.withoutResponse(req);
  } catch (err) {
    res.status(401).json({ error: err.message });
    return;
  }
  next();
};

// This is for when you want to require a user to be logged in, but you aren't using express' req/res/next, you just have req with req.cookies
module.exports.withoutResponse = async req => {
  let { id, sessionCookie } = req.cookies;
  req.user = await mongo.collection('users').findOne({ _id: id });
  if (!req.user) {
    throw new Error('Could not find that user');
  }
  const session = await mongo
    .collection('sessions')
    .findOne({ sessionCookie, userID: id });
  if (!session) {
    throw new Error('Could not find that session');
  }
};
