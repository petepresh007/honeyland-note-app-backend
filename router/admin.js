const express = require("express");
const router = express.Router();
const { AUTHTWO } = require("../middleware/AUT2");
const { registration, login, stayLoggedIn, logoutAdmin, getSingUserID } = require("../contollers/admin");

router.post("/registration", registration);
router.post("/login", login);
router.post("/logout", logoutAdmin)
router.get("/stayonline", stayLoggedIn);
router.get('/singleuser', AUTHTWO, getSingUserID)


module.exports = router;