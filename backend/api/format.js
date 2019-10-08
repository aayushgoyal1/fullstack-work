// Route lists all of the accepted formats
module.exports = (req, res) => {
  res.json(config.acceptedFormats);
};
