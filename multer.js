const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./upload");
    },
    filename: function (req, file, callback) {
        const pictureCode = Date.now() + "-" + Math.floor(Math.random() * 1e9);
        // const filename = file.originalname.split(".")[0];
        callback(null, pictureCode + "-" + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (req.body.author || req.body.description && req.body.topic && req.body.subject) {
        cb(null, true)
    } else {
        cb(new Error('All required fields are not present'), false);
    }
}

const uploads = multer({
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 5, //5mb
    }, /**fileFilter: fileFilter*/ //specify the file type
})

module.exports = uploads;