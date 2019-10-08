const ffmpeg = require('ffmpeg-static').path;
const { exec } = require('child_process');

// This function will take a stream of video or a path to a video file and extract all the frames to files.
// Example usage:
//   extractFrames(
//     'some/video.webm', // You can also use data from a socket
//     [ // Everything in this array is optional - you don't have to use any transformations
//       module.exports.transform.frameRate(10), // Only use 10 frame per second
//       module.exports.transform.frameSize(undefined, 720), // Resize to 720p
//     ],
//     921, // The resulting files will have 3 digits in it, because 921 has 3 digits
//     'some_directory/frame_', // The files will be in some_directory and start with frame_
//     '_of_video.jpg') // The resulting file will end in _of_video.jpg
// The first frame will be put in 'some_directory/frame_000_of_video.jpg'
const extractFrames = (video, transformations, maxFrames, prefix, suffix) => {
  // The reason maxFrames is needed is to tell FFMpeg how many digits are in a filename
  const numDigits = Math.floor(Math.log10(maxFrames));
  // The output will start with the prefix, then the frame number, then the suffix
  const outputPath = `${prefix}%0${numDigits}d${suffix}`;

  // If the input isn't a string, it's a stream, so let the input be - for STDIN
  const input = typeof video === 'string' ? '"' + video + '"' : '-';

  const filters = transformations.join(', ');

  // This is the final command to run
  const cmd = `"${ffmpeg}" -threads 1 -i ${input} -vf "${filters}" "${outputPath}"`;
  console.log(cmd);
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
  const videoConfig = config.processing.frames;
  if (!videoConfig) {
    return; // This isn't configured to process frames
  }
  let transformations = [];
  if (videoConfig.fps) {
    transformations.push(module.exports.transform.frameRate(videoConfig.fps));
  }
  if (videoConfig.width || videoConfig.height) {
    transformations.push(
      module.exports.transform.frameSize(videoConfig.width, videoConfig.height)
    );
  }
  return await extractFrames(
    video,
    transformations,
    videoConfig.maxFramesPerVideo,
    videoConfig.outputDir + '/' + id + '.',
    '.' + videoConfig.frameExtension
  );
};

// Export the full thing, just in case someone wants to use it without the defaults
module.exports.extractFrames = extractFrames;

// These are transformations. They just give you things to pass into ffmpeg's video filters
module.exports.transform = {
  frameRate(fps) {
    return `fps=${fps}`;
  },
  frameSize(width, height = undefined) {
    if (!width) {
      width = 'trunc(oh*a/2)*2';
    }
    if (!height) {
      height = 'trunc(ow/a/2)*2';
    }
    return `scale=${width}:${height}`;
  }
};
