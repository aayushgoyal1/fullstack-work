module.exports.isLoggedIn = (req, res) => {
  res.json({
    userID: req.user._id.toString(),
    sessionCookie: req.cookies.sessionCookie,
    consented: req.user.consented,
    username: req.user.username
  });
};

module.exports.gaveConsent = async (req, res) => {
  await mongo
    .collection('users')
    .updateOne({ _id: req.user._id }, { $set: { consented: true } });
  res.json({ error: false });
};
