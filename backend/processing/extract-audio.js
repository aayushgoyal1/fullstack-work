const ffmpeg = require('ffmpeg-static').path;
const { exec } = require('child_process');

// This function will take a stream of video or a path to a video file, and extract all the audio to a file.
// Example usage:
//   extractAudio(
//     'some/video.webm', // You can also use data from a socket
//     [ // Everything in this array is optional - you don't have to use any transformations
//       module.exports.mono() // If the audio has 2+ channels, downmix them into a single channel
//     ],
//     'some_directory/audio.m4a') // The output will be put into this file
const extractAudio = (video, transformations, outputPath) => {
  // If the input isn't a string, it's a stream, so let the input be - for STDIN
  const input = typeof video === 'string' ? '"' + video + '"' : '-';

  const filters = transformations.join(' ');

  const cmd = `"${ffmpeg}" -i ${input} -vn ${filters} "${outputPath}"`;
  return new Promise((resolve, reject) => {
    execution = exec(cmd, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    if (typeof video !== 'string') {
      video.pipe(execution.stdin);
    }
  });
};

// Uses defaults based on the config file
module.exports = async (video, id) => {
  const audioConfig = config.processing.audio;
  if (!audioConfig) {
    return; // This isn't configured to process audio
  }
  let transformations = [];
  if (audioConfig.mono) {
    transformations.push(module.exports.transform.mono());
  }
  return await extractAudio(
    video,
    transformations,
    audioConfig.outputDir + '/' + id + '.' + audioConfig.audioExtension
  );
};

// Export the full thing, just in case someone wants to use it without the defaults
module.exports.extractAudio = extractAudio;

// These are transformations. They just give you things to pass into ffmpeg
module.exports.transform = {
  // For more on channel manipulation, see https://trac.ffmpeg.org/wiki/AudioChannelManipulation
  mono() {
    return '-ac 1';
  }
};
