const ffprobe = require('ffprobe-static').path;
const { exec } = require('child_process');

const getStreamTypes = media => {
  // If the input isn't a string, it's a stream, so let the input be - for STDIN
  const input = typeof media === 'string' ? '"' + media + '"' : '-';

  // This is the final command to run
  //const cmd = `"${ffmpeg}" -i ${input} -vf "${filters}" "${outputPath}"`;
  const cmd = `"${ffprobe}" -v error -show_entries stream=codec_type -of default=nokey=1:noprint_wrappers=1 ${input}`;
  console.log(cmd);
  return new Promise((resolve, reject) => {
    execution = exec(cmd, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    if (typeof media !== 'string') {
      media.pipe(execution.stdin);
    }
  });
};

// Uses defaults based on the config file
module.exports = async media => {
  return getStreamTypes(media).split('\n');
};
