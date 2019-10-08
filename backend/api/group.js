// This route is to get a specific group
module.exports.specific = async (req, res) => {
  res.json(req.group);
};

// This route is to get a list of groups
module.exports.listAll = async (req, res) => {
  res.json(
    await mongo
      .collection('groups')
      .find({ members: req.user._id.toString() })
      .toArray()
  );
};

// This is for when you have a route with :groupID in the URL
module.exports.param = async (req, res, next, groupID) => {
  const { ObjectID } = require('mongodb');
  req.group = await mongo
    .collection('groups')
    .findOne({ _id: new ObjectID(groupID), members: req.user._id.toString() });
  next();
};
