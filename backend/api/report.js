// This route is to get a report for a specific video
module.exports.specificVideo = async (req, res) => {
  if (req.reports.length === 0) {
    res.status(404).json({ error: 'No data available yet' });
  } else {
    res.json({
      labels: config.featureNames[req.reports[0].featureID],
      colors: config.featureColors[req.reports[0].featureID],
      features: req.reports.map(report => report.prediction),
      uploadedAt: req.video.uploadedAt,
      fps: req.video.fps
    });
  }
};

// This route is to get a list of reports
module.exports.listAll = async (req, res) => {
  // To get a list of reports, just give a list of all the videos that have been uploaded
  // TODO: filter out videos that don't have their report finished
  res.json(
    await mongo
      .collection('videos')
      .find({ uploadedBy: req.user._id.toString() })
      .toArray()
  );
};

// This is for when you have a route with :videoID in the URL
module.exports.param = async (req, res, next, videoID) => {
  const { ObjectID } = require('mongodb');
  req.video = await mongo.collection('videos').findOne({
    _id: new ObjectID(videoID),
    uploadedBy: req.user._id.toString()
  });

  req.reports = await mongo
    .collection('predictions')
    .find({ videoID: req.video._id.toString() })
    .sort({ frame_num: 1 })
    .toArray();
  next();
};

// These routes are for aggregating all the reports for a whole lecture/project/group
module.exports.aggregateLecture = async (req, res, next) => {
  try {
    res.json(
      await aggregateReport({
        lectureID: req.lecture._id.toString(),
        uploadedBy: req.user._id.toString()
      })
    );
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports.aggregateProject = async (req, res, next) => {
  try {
    res.json(
      await aggregateReport({
        projectID: req.project._id.toString(),
        uploadedBy: req.user._id.toString()
      })
    );
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports.aggregateGroup = async (req, res, next) => {
  try {
    res.json(
      await aggregateReport({
        groupID: req.group._id.toString(),
        uploadedBy: req.user._id.toString()
      })
    );
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const aggregateReport = async criteria => {
  const videos = await mongo
    .collection('videos')
    .find(criteria)
    .toArray();
  if (videos.length === 0) {
    throw new Error('No videos to be analyzed');
  }
  const reports = await mongo
    .collection('predictions')
    .find({ videoID: { $in: videos.map(video => video._id.toString()) } })
    .toArray();
  return {
    labels: config.featureNames[reports[0].featureID],
    colors: config.featureColors[reports[0].featureID],
    features: reports.map(report => report.prediction),
    uploadedAt: new Date(),
    fps: videos[0].fps
  };
};
