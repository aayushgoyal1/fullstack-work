const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const cookieParser = require('cookie-parser')();
const mustBeLoggedIn = require('./api/must-be-logged-in.js');
const extractAudio = require('./processing/extract-audio.js');
const extractFrames = require('./processing/extract-frames.js');

// Accepts a WebSocket server (wss) and then sets it up
module.exports = wss => {
  wss.on('connection', async (ws, req) => {
    const urlParts = req.url
      .substr('/api/video/'.length)
      .split('/')
      .map(decodeURIComponent);
    // There have to be at least 4 parts (userID, sessionCookie, groupID, extension)
    if (urlParts.length < 4) {
      ws.close();
      return;
    }

    req.cookies = {};
    req.cookies.id = urlParts.shift();
    req.cookies.sessionCookie = urlParts.shift();

    // Make sure the user is logged in
    try {
      await mustBeLoggedIn.withoutResponse(req);
    } catch (err) {
      console.log(err);
      ws.close();
      return;
    }

    const extension = urlParts.pop(); // The very last thing is the extension
    // TODO: check the extension of the file here!

    let putInDB = {
      extension,
      uploadedBy: req.user._id.toString(),
      uploadedAt: new Date()
    };

    let [groupID, projectID, lectureID] = urlParts;
    if (lectureID) {
      putInDB.lectureID = lectureID;
    } else if (projectID) {
      putInDB.projectID = projectID;
    } else {
      putInDB.groupID = groupID;
    }

    const result = await mongo.collection('videos').insertOne(putInDB);

    // Send back the ID of the video that was just recorded
    const videoID = result.insertedId;
    ws.send(JSON.stringify({ videoID }));

    // Create a stream to save the video to a file
    const path = config.uploadsDir + '/' + videoID + '.' + extension;
    const videoStream = fs.createWriteStream(path);

    // These will be streams (or fake streams) used by extractFrames or extractAudio
    let videoStreamForFrames, videoStreamForAudio;

    // Only use a real stream if the server is configured for it
    // TODO: also check if the task scheduler will allow this processing
    if (config.processing.frames) {
      videoStreamForFrames = new Readable();
      videoStreamForFrames._read = () => {}; // Needed for some versions of Node.js
      extractFrames(videoStreamForFrames, videoID);
    } else {
      // Supply a fake stream instead of actually streaming to extract frames
      videoStreamForFrames = { push: () => {} };
    }

    if (config.processing.audio) {
      videoStreamForAudio = new Readable();
      videoStreamForAudio._read = () => {}; // Needed for some versions of Node.js
      extractAudio(videoStreamForAudio, videoID);
    } else {
      // Supply a fake stream instead of actually streaming to extract frames
      videoStreamForAudio = { push: () => {} };
    }

    ws.on('message', data => {
      videoStream.write(data);
      videoStreamForFrames.push(data);
      videoStreamForAudio.push(data);
    });
    ws.on('close', () => {
      videoStream.end();
      videoStreamForFrames.push(null);
      videoStreamForAudio.push(null);
    });
  });
};
