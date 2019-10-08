var chokidar = require('chokidar');
var { basename, sep } = require('path');

var watcher = chokidar.watch(config.teacherVideosDir, {
  ignored: /(^|[\/\\])\../,
  ignoreInitial: true,
  persistent: true
});

var log = console.log.bind(console);

//Add directory to 'groups' collection in Mongo
//or if it is a subdirectory, then add it to 'projects'
watcher
  .on('addDir', async path => {
    let name = basename(path);

    // Removes beginning of path, which is just the root directory's name, and splits by directory
    path = path.substr(config.teacherVideosDir.length).split(sep);
    // If the first part of the path is empty (because it started with /), skip it
    if (path[0] === '') {
      path.shift();
    }

    if (path.length > 1) {
      const groupID = (await mongo
        .collection('groups')
        .findOne({ name: path[0] }))._id.toString();
      await mongo.collection('projects').insertOne({
        name: name,
        groupID: groupID
      });
    } else if (path.length == 1) {
      await mongo.collection('groups').insertOne({
        name: name,
        members: [config.demoUserID]
      });
    }
  })
  .on('add', async path => {
    let name = basename(path);

    // Removes beginning of path, which is just the root directory's name, and splits by directory
    path = path.substr(config.teacherVideosDir.length).split(sep);

    // If the first part of the path is empty (because it started with /), skip it
    if (path[0] === '') {
      path.shift();
    }

    // Find which group it belongs to in case there are multiple projects with the same name

    const projectID = await mongo
      .collection('projects')
      .find({ name: path[1] })
      .toArray();
    if (projectID.length === 1) {
      await mongo.collection('lectures').insertOne({
        name: name,
        projectID: projectID[0]['_id'].toString()
      });
    }
    // there are multiple projects with the same name
    else {
      // There could only be 1 unique group name
      // find the _id for that group name
      let groupID = (await mongo
        .collection('groups')
        .findOne({ name: path[0] }))._id.toString();

      // From that group name, find the projectID with that groupID
      let projectID = (await mongo
        .collection('projects')
        .findOne({ groupID: groupID }))._id.toString();
      // Add the lecture using the projectID found previously
      await mongo.collection('lectures').insertOne({
        name: name,
        projectID: projectID
      });
    }
  })
  .on('unlink', async path => {
    path = path.substr(config.teacherVideosDir.length).split(sep);

    if (path[0] === '') {
      path.shift();
    }

    // path array would be something like groupName/projectName/lectureName
    if (path.length === 3) {
      let groupName = path[0];
      let projectName = path[1];
      let lectureName = path[2];
      // Find the groupID using group name
      let groupID = (await mongo
        .collection('groups')
        .findOne({ name: groupName }))._id.toString();
      // find projectID using groupID
      let projectID = (await mongo
        .collection('projects')
        .findOne({ name: projectName, groupID: groupID }))._id.toString();
      // remove the lecture with he projectID found previously
      await mongo
        .collection('lectures')
        .deleteOne({ name: lectureName, projectID: projectID });
    }
  })
  .on('unlinkDir', async path => {
    path = path.substr(config.teacherVideosDir.length).split(sep);

    if (path[0] === '') {
      path.shift();
    }

    let groupName = path[0];
    // Find groupID using groupName
    let groupID = (await mongo
      .collection('groups')
      .findOne({ name: groupName }))._id.toString();

    // if path.length == 2, that means the path is group/project
    if (path.length === 2) {
      let projectName = path[1];

      // find projectID using groupID
      let projectID = (await mongo
        .collection('projects')
        .findOne({ name: projectName, groupID: groupID }))._id.toString();
      // Remove the project
      await mongo
        .collection('projects')
        .deleteOne({ name: projectName, groupID: groupID });
      // Remove all lectures with that projectID
      await mongo.collection('lectures').deleteMany({ projectID: projectID });
    }
    // the whole group is removed
    else {
      // Remove the group
      await mongo.collection('groups').deleteOne({ name: path[0] });
      // Find all projectID with that groupID
      projects = (await mongo
        .collection('projects')
        .find({ groupID: groupID })).toArray();
      // Find all project ID in projects
      let projectIDs = [];
      for (i = 0; i < projects.length; i++) {
        projectIDs.push(projects[i]._id);
      }
      // Delete all lectures within the list of projectIDs
      for (i = 0; i < projectIDs.length; i++) {
        projectID = projectIDs[i];
        await mongo.collection('lectures').deleteMany({ projectID, projectID });
      }
    }
  })
  .on('error', error => {});
