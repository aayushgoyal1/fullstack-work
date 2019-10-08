const extractAudio = require('../processing/extract-audio.js');
const extractFrames = require('../processing/extract-frames.js');
const rename = require('util').promisify(require('fs').rename);

module.exports = async (req, res) => {
  // Get the extension of the file
  const extension = req.file.originalname
    .split('.')
    .pop()
    .toLowerCase();

  let putInDB = {
    extension,
    uploadedBy: req.user._id.toString(),
    uploadedAt: new Date()
  };

  if (req.lecture) {
    putInDB.lectureID = req.lecture._id.toString();
  } else if (req.project) {
    putInDB.projectID = req.project._id.toString();
  } else {
    putInDB.groupID = req.group._id.toString();
  }

  // Get rid of unnecessary details. Like if you have the projectID, then you don't need groupID to be stored in MongoDB
  if (typeof projectID !== 'undefined') {
    group = undefined;
  }
  if (typeof lectureID !== 'undefined') {
    project = undefined;
  }

  const result = await mongo.collection('videos').insertOne(putInDB);
  res.send({ videoID: result.insertedId });

  // Now that the response has been sent, rename the video file to have the MongoDB ID as their filename
  const newName = req.file.path.replace(
    req.file.filename,
    result.insertedId + '.' + extension
  );
  rename(req.file.path, newName);

  // Processes the video
  extractAudio(newName, result.insertedId);
  extractFrames(newName, result.insertedId);
};
