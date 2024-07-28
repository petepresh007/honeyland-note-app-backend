const express = require("express");
const router = express.Router();
const {
    createWps,
    approveNote,
    blockNote,
    hodApproveNote,
    hodBlockNote,
    deleteWpsHodAdmin,
    hodDeleteNote,
    userDeleteNote,
    getAllNoteHod,
    getAllUserNote,
    getAllUserAdmin
} = require("../contollers/wps");

const { AUTHTWOUSER, AUTHTWO, AUTHTWOHOD } = require("../middleware/AUT2");


router.post('/create', AUTHTWOUSER, createWps);
router.patch("/approve/:noteID", AUTHTWO, approveNote);
router.patch("/block/:noteID", AUTHTWO, blockNote);
router.patch("/hodapprove/:noteID", AUTHTWOHOD, hodApproveNote);
router.patch("/hodblock/:noteID", AUTHTWOHOD, hodBlockNote);

router.get("/allhod", AUTHTWOHOD, getAllNoteHod)
router.get("/alladmin", AUTHTWO, getAllUserAdmin)
router.get("/alluser", AUTHTWOUSER, getAllUserNote)



router.delete("/del/:noteID", AUTHTWO, deleteWpsHodAdmin);
router.delete("/hoddel/:noteID", AUTHTWOHOD, hodDeleteNote);
router.delete("/userdel/:noteID", AUTHTWOUSER, userDeleteNote);




module.exports = router;