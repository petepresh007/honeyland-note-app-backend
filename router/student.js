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
    search,
    adminAegisterUser,
    adminRegisterUserViaUpload,
    assignCategory
} = require("../contollers/student");

const { AUTHTWO, AUTHTWOSTUDENT } = require("../middleware/AUT2");
const upload = require("../multer");


router.post("/registerUser", upload.single("file"), registerUser);
router.post("/loginUser", loginUser);
router.patch("/approve/:userID", AUTHTWO, approveUser);
router.patch("/blockUser/:userID", AUTHTWO, blockUser);
router.get("/stay_logged", stayLoggedIn);
router.get("/single_user/:userID", getSingleUser);
router.post("/logoutuser", logoutUser);
router.patch("/updateprofilepics", upload.single("file"), AUTHTWOSTUDENT, updateProfilePics);
router.get("/singleuser", AUTHTWOSTUDENT, getSingUserID)
router.patch("/password", AUTHTWOSTUDENT, updateUsernamePassword);
router.get("/approveduser", AUTHTWO, getActivatedUsers)
router.get("/notapproved", AUTHTWO, getNotActivatedUsers)
router.get("/allusers", AUTHTWO, getAllUsers);
router.delete('/deleteuser/:userID', AUTHTWO, deleteSingleUser);
router.get("/search", AUTHTWO, search);
router.post("/adminreguser", AUTHTWO, adminAegisterUser)
router.post('/adminreguserupload', AUTHTWO, upload.single("file"), adminRegisterUserViaUpload)

router.post('/forgetpassword', forgetPassword);
router.post('/reset-password/:token', changeForgottenPassword);

router.patch("/assigncategory/:userID", AUTHTWO, assignCategory);

module.exports = router