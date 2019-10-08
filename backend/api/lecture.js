const { join } = require('path');
const { ObjectID } = require('mongodb');

// This route is to get a specific lecture
module.exports.specific = async (req, res, next) => {
  const project = await mongo
    .collection('projects')
    .findOne({ _id: new ObjectID(req.lecture.projectID) });
  const group = await mongo
    .collection('groups')
    .findOne({ _id: new ObjectID(project.groupID) });
  const filePath = join(
    config.teacherVideosDir,
    group.name,
    project.name,
    req.lecture.name
  );
  return new Promise((resolve, reject) => {
    res.sendFile(filePath, err => {
      if (err) {
        next(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// This route is to get a list of lectures
module.exports.listAllByProject = async (req, res) => {
  res.json(
    await mongo
      .collection('lectures')
      .find({ projectID: req.project._id.toString() })
      .toArray()
  );
};

// This is for when you have a route with :lectureID in the URL
module.exports.param = async (req, res, next, lectureID) => {
  // TODO: check if user has permission to see this lecture
  req.lecture = await mongo
    .collection('lectures')
    .findOne({ _id: new ObjectID(lectureID) });
  next();
};
