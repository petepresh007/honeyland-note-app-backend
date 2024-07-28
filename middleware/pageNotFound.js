const notFoundPage = (req, res) => res.status(404).json({ msg: `<p>Page not found</p>` });
module.exports = notFoundPage; 