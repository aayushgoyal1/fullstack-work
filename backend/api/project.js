// This route is to get a list of projects
module.exports.specific = async (req, res) => {
  res.json(req.project);
};

// This route is to get a list of projects
module.exports.listAll = async (req, res) => {
  // TODO: filter out projects that this user shouldn't be able to see
  res.json(
    await mongo
      .collection('projects')
      .find({ groupID: req.group._id.toString() })
      .toArray()
  );
};

// This is for when you have a route with :projectID in the URL
module.exports.param = async (req, res, next, projectID) => {
  const { ObjectID } = require('mongodb');
  // TODO: check if user has permission to read this project
  req.project = await mongo
    .collection('projects')
    .findOne({ _id: new ObjectID(projectID) });
  next();
};
