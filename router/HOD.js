const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    blockUser,
    approveUser,
    stayLoggedIn,
    getSingleUser,
    logoutUser,
    updateProfilePics,
    getSingUserID,
    updateUsernamePassword,
    getActivatedUsers,
    getNotActivatedUsers,
    getAllUsers,
    deleteSingleUser,
    forgetPassword,
    changeForgottenPassword,
    adminRegisterUser,
    search
} = require("../contollers/HOD");

const { AUTHTWO, AUTHTWOHOD } = require("../middleware/AUT2");
const upload = require("../multer");


router.post("/registerUser", upload.single("file"), registerUser);
router.post("/loginUser", loginUser);
router.patch("/approve/:userID", AUTHTWO, approveUser);
router.patch("/blockUser/:userID", AUTHTWO, blockUser);
router.get("/stay_logged", stayLoggedIn);
router.get("/single_user/:userID", getSingleUser);
router.post("/logoutuser", logoutUser);
router.patch("/updateprofilepics", upload.single("file"), AUTHTWOHOD, updateProfilePics);
router.get("/singleuser", AUTHTWOHOD, getSingUserID)
router.patch("/password", AUTHTWOHOD, updateUsernamePassword);
router.get("/approveduser", AUTHTWO, getActivatedUsers)
router.get("/notapproved", AUTHTWO, getNotActivatedUsers)
router.get("/allusers", AUTHTWO, getAllUsers);
router.delete('/deleteuser/:userID', AUTHTWO, deleteSingleUser);
router.post('/forgetpassword', forgetPassword);
router.post('/reset-password/:token', changeForgottenPassword);


router.post('/adminreguser', AUTHTWO, adminRegisterUser);
router.get('/search', AUTHTWO, search)

module.exports = router