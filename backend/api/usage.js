// Disk Usage Route for Input File Upload

const disk = require('diskusage');
const os = require('os');

let path = os.platform() === 'win32' ? 'c:' : '/';

module.exports = async (req, res) => {
  const { free } = await disk.check(path);
  res.json(free);
};
