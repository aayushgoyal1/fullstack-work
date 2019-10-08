// The backend API routing is setup here.
// NOTE: All paths here will be prefixed by /api
// For example, if you write /foo here then it will actually be /api/foo
const express = require('express');
const app = express();
const api = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const { dirname } = require('path');
const upload = multer({ dest: config.uploadsDir });
const login = require('./login.js');

api.use(bodyParser.json()); // for parsing application/json
api.use(bodyParser.urlencoded({ extended: true }));

// PUT ROUTES HERE IF NON-LOGGED IN USERS CAN USE THEM
api.get('/hello', require('./hello.js'));

api.get('/login', login);
api.post('/login', login);
api.get('/login/metadata', login.samlMetadata);

// Check acceptable file formats from file upload
api.get('/format/list', require('./format.js'));
// Check disk usage for input files
api.get('/usage', require('./usage.js'));

// PUT ROUTES HERE IF YOU MUST BE LOGGED IN TO USE THEM
api.use(require('./must-be-logged-in.js'));
api.post('/gave-consent', require('./user-misc.js').gaveConsent);
api.get('/is-logged-in', require('./user-misc.js').isLoggedIn);
api.get('/groups', require('./group.js').listAll);

// After this, all routes with a :groupID parameter will get the group's document added to them
api.param('groupID', require('./group.js').param);
api.get('/group/:groupID', require('./group.js').specific);
api.get('/projects/:groupID', require('./project.js').listAll);

// After this, all routes with a :projectID parameter will get the project's document added to them
api.param('projectID', require('./project.js').param);
api.get('/project/:projectID', require('./project.js').specific);

api.get(
  '/lectures/project/:projectID',
  require('./lecture.js').listAllByProject
);

// After this, all routes with a :videoID parameter will get a list of reports added to them
api.param('videoID', require('./report.js').param);
api.get('/report/video/:videoID', require('./report.js').specificVideo);
api.get('/report/project/:projectID', require('./report.js').aggregateProject);
api.get('/report/group/:groupID', require('./report.js').aggregateGroup);
api.get('/video/:videoID', require('./video.js').specific);

// After this, all routes with a :lectureID parameter will get the lecture's document added to them
api.param('lectureID', require('./lecture.js').param);
api.get('/report/lecture/:lectureID', require('./report.js').aggregateLecture);
api.get('/lecture/:lectureID', require('./lecture.js').specific);
api.get('/videos/group/:groupID', require('./video.js').listAllByGroup);
api.get('/videos/project/:projectID', require('./video.js').listAllByProject);
api.get('/videos/lecture/:lectureID', require('./video.js').listAllByLecture);
api.post(
  '/video/*/*/:groupID/:projectID/:lectureID',
  upload.single('video'),
  require('./videoupload.js')
);
api.post(
  '/video/*/*/:groupID/:projectID',
  upload.single('video'),
  require('./videoupload.js')
);
api.post(
  '/video/*/*/:groupID',
  upload.single('video'),
  require('./videoupload.js')
);

module.exports = api;
