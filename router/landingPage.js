const express = require("express");
const router = express.Router();
const {
    createLandingPage,
    getAllLanding
} = require("../contollers/landingPage");
const {AUTHTWO} = require("../middleware/AUT2");


router.post("/create", AUTHTWO, createLandingPage);
router.get("/all", getAllLanding)

module.exports = router;