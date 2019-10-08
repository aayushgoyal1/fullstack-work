// This sets up a proxy for development, so that requests to /api are routed to the backend
const proxy = require('http-proxy-middleware');
const config = require('./config.js');

module.exports = app => {
  app.use(proxy('/api', { target: 'http://localhost:' + config.port }));
  app.use(proxy('/logout', { target: 'http://localhost:' + config.port }));
  app.use(
    proxy('/api', { target: 'http://localhost:' + config.port, ws: true })
  );
};
