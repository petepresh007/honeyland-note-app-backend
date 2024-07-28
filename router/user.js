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
    hodGetAllUsers,
    forgetPassword,
    changeForgottenPassword,
    AssignSubject,
    AssignClass,
    AdminRegisterUser,
    search,
    
} = require("../contollers/user");

const { AUTHTWO, AUTHTWOUSER, AUTHTWOHOD } = require("../middleware/AUT2");
const upload = require("../multer");


router.post("/registerUser", upload.single("file"), registerUser);
router.post("/loginUser", loginUser);
router.patch("/approve/:userID", AUTHTWO, approveUser);
router.patch("/blockUser/:userID", AUTHTWO, blockUser);
router.get("/stay_logged", stayLoggedIn);
router.get("/single_user/:userID", getSingleUser);
router.post("/logoutuser", logoutUser);
router.patch("/updateprofilepics", upload.single("file"), AUTHTWOUSER, updateProfilePics);
router.get("/singleuser", AUTHTWOUSER, getSingUserID)
router.patch("/password", AUTHTWOUSER, updateUsernamePassword);
router.get("/approveduser", AUTHTWO, getActivatedUsers)
router.get("/notapproved", AUTHTWO, getNotActivatedUsers)
router.get("/allusers", AUTHTWO, getAllUsers);
router.delete('/deleteuser/:userID', AUTHTWO, deleteSingleUser)
router.post('/forgetpassworduser', forgetPassword);
router.post('/reset-passworduser/:token', changeForgottenPassword);


//HOD related
router.get("/hodallusers", AUTHTWOHOD, hodGetAllUsers);

//Admin related
//assign subject
router.patch("/assignsubject/:userID", AUTHTWO, AssignSubject);
router.patch('/assignClass/:userID', AUTHTWO, AssignClass);
router.post("/adminreguser", AUTHTWO, AdminRegisterUser);
router.get("/search", AUTHTWO, search);


module.exports = router