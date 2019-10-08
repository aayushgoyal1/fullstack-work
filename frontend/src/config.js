// These config details MUST be exported to the frontend. All other config details are in ../../config.js
// CommonJS-style exports are used here because this code MUST be usable by the backend

// This is the port that the backend is on will be 80 (normal HTTP port) in production, and 46601 in development
if (process.env.NODE_ENV === 'production') {
  exports.port = 80;
  exports.isProduction = true;
} else {
  exports.port = 46601;
  exports.isProduction = false;
}

// The user ID for the demo user
exports.demoUserID = 'demo';
// The sessionCookie for the demo user
exports.demoUserSessionCookie = "it's a demo, please don't abuse it";

// Number of milliseconds to wait between sending video that is being recorded.
// If you set this to less than 100, performance will suffer greatly.
// If you set this to a large number (e.g. 5000) you increase the risk of losing data
exports.intervalToSendVideo = 500;
