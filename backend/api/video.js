// This route is to get a specific group
module.exports.specific = async (req, res) => {
  res.json(req.video);
};

// This route is to get a list of videos for a specific group, as long as it isn't associated with any project/lecture
module.exports.listAllByGroup = async (req, res) => {
  res.json(
    module.exports.nameVideosInOrder(
      await mongo
        .collection('videos')
        .find({
          groupID: req.group._id.toString(),
          uploadedBy: req.user._id.toString()
        })
        .sort({ uploadedAt: 1 })
        .toArray()
    )
  );
};

// This route is to get a list of videos for a specific project, as long as it isn't associated with any lecture
module.exports.listAllByProject = async (req, res) => {
  res.json(
    module.exports.nameVideosInOrder(
      await mongo
        .collection('videos')
        .find({
          projectID: req.project._id.toString(),
          uploadedBy: req.user._id.toString()
        })
        .sort({ uploadedAt: 1 })
        .toArray()
    )
  );
};

// This route is to get a list of videos for a specific lecture
module.exports.listAllByLecture = async (req, res) => {
  res.json(
    module.exports.nameVideosInOrder(
      await mongo
        .collection('videos')
        .find({
          lectureID: req.lecture._id.toString(),
          uploadedBy: req.user._id.toString()
        })
        .sort({ uploadedAt: -1 })
        .toArray()
    )
  );
};

module.exports.nameVideosInOrder = videos => {
  for (let i = 0; i < videos.length; i++) {
    videos[i].name = 'Recording ' + (i + 1);
  }
  return videos;
};
