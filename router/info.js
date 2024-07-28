const express = require("express");
const router = express.Router()
const {AUTHTWO} = require("../middleware/AUT2");
const {createInformation} = require("../contollers/info");
const upload = require("../multer");


router.post("/create", upload.single("file"), createInformation)

module.exports = router