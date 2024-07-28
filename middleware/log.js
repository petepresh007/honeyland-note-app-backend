module.exports.logs = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    res.on('finish', () => {
        console.log(`${res.statusCode} ${res.statusMessage}`);
    });
    next();
}