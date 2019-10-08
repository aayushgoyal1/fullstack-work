const http = require('http');
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');

const frontendDir = path.dirname(__dirname) + '/frontend/build';
let homePage;
try {
  homePage = require('fs')
    .readFileSync(frontendDir + '/index.html')
    .toString();
} catch (e) {
  homePage =
    "You haven't ran <code>npm run build</code> yet. " +
    'Run that and then restart me so I can cache it.';
}

// Setup the global configuration for this app
require('./configure.js');

// Next, connect to mongodb:
require('./mongo.js')
  .connect()
  .then(connection => {
    global.mongo = connection;
    const server = express();

    // Setup express to route /api requests, and to route frontend requests
    server.use(express.static(frontendDir));
    server.use(cookieParser());
    server.use('/api', require('./api/routes.js'));
    // Add a route for logging out
    server.get('/logout', (req, res) => {
      res.clearCookie('id', { path: '/api' });
      res.clearCookie('sessionCookie', { path: '/api' });
      res.redirect('/');
      // In the background, also delete this session
      try {
        mongo.collection('sessions').deleteOne({
          userID: req.cookies.id.toString(),
          sessionCookie: req.cookies.sessionCookie.toString()
        });
      } catch (err) {}
    });
    // React-router is in charge of routing on the frontend.
    // Allow all routes that don't start with /api to route to the home page
    server.get('*', (req, res, next) => {
      if (req.path.substr(0, 5) !== '/api/') {
        res.send(homePage);
      } else {
        next();
      }
    });

    // Listen on the port and put all of the requests through express
    const httpServer = http.createServer(server).listen(config.port, () => {
      console.log('Server is up and running on port', config.port);
    });

    // Add a WebSocket server
    const wss = new WebSocket.Server({ server: httpServer });
    require('./websocketserver.js')(wss);
    require('./watcher.js');

    // Every minute, delete old login sessions every minute
    setInterval(
      () =>
        mongo
          .collection('sessions')
          .deleteMany({ expires: { $lte: new Date() } }),
      60 * 1000
    );
  });
