// Sets up the global configuration for this app
module.exports = global.config = Object.assign(
  {},
  require('../config.json'),
  require('../frontend/src/config.js')
);

const { join, dirname } = require('path');
const fs = require('fs');

// If SAML is turned on and a private key exists, fix its paths.
// But if the private key doesn't exist, disable SAML
if (config.SAML) {
  config.SAML.sign.cert = join(dirname(__dirname), config.SAML.sign.cert);
  config.SAML.sign.privateKey = join(
    dirname(__dirname),
    config.SAML.sign.privateKey
  );
  config.SAML.encrypt.cert = join(dirname(__dirname), config.SAML.encrypt.cert);
  config.SAML.encrypt.privateKey = join(
    dirname(__dirname),
    config.SAML.encrypt.privateKey
  );
  if (
    !fs.existsSync(config.SAML.sign.privateKey) ||
    !fs.existsSync(config.SAML.encrypt.privateKey)
  ) {
    config.SAML = false;
  }
}

// Fix paths and make sure they exist
config.uploadsDir = join(dirname(__dirname), config.uploadsDir);
fs.mkdirSync(config.uploadsDir, { recursive: true });
config.teacherVideosDir = join(dirname(__dirname), config.teacherVideosDir);
fs.mkdirSync(config.teacherVideosDir, { recursive: true });
if (config.processing.frames) {
  config.processing.frames.outputDir = join(
    dirname(__dirname),
    config.processing.frames.outputDir
  );
  fs.mkdirSync(config.processing.frames.outputDir, { recursive: true });
}
if (config.processing.audio) {
  config.processing.audio.outputDir = join(
    dirname(__dirname),
    config.processing.audio.outputDir
  );
  fs.mkdirSync(config.processing.audio.outputDir, { recursive: true });
}
