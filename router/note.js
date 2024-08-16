const express = require("express");
const router = express.Router();
const upload = require("../multer");
const { AUTHTWO, AUTHTWOUSER, AUTHTWOHOD, AUTHTWOSTUDENT } = require("../middleware/AUT2");
const {
    createNote,
    // readAllnotes,
    // readSingleNote,
    editDetails,
    deleteNote,
    downloadNotes,
    getAllNotes,
    singleNote,
    ReadFileWithApp,
    search,
    getAllNotesWithoutLimit,
    getChemistry,
    getComputerNote,
    getEnglishLanguage,
    getPhysics,
    getMathematicsNote,
    getOthers,
    userCreateNote,
    getUserNotes,
    userSearch,
    userDeleteCreatedNote,
    editCreatedNoteByUser,
    generalSearch,
    getAllNoteAdmin,
    deleteNoteAdmin,
    getAllNoteAdminApproved,
    getAllNoteAdminNotApproved,
    approveNote,
    blockNote,
    scan,
    getAllScienceNote,
    getAllScienceNoteApproved,
    getAllScienceNoteNotApproved,
    hodApproveNote,
    hodBlockNote,
    hodDeleteNote,
    getSciNoteAdmin,
    getArtNoteAdmin,
    getHumanNoteAdmin,
    getLangNoteAdmin,
    getMathsNoteAdmin,
    getVocationalNoteAdmin,
    getAllSubjectTeacher
} = require("../contollers/note");



/**CREATING ALL THE ROUTES */
router.post("/", AUTHTWO, upload.single("file"), createNote);
router.post("/usercreatenote", AUTHTWOUSER, upload.single("file"), userCreateNote);
router.patch("/userupdatenote/:noteID", AUTHTWOUSER, upload.single("file"), editCreatedNoteByUser);



// router.route("/").get(readAllnotes);
// router.get("/:id", readSingleNote);
router.patch("/:noteID", upload.single("file"), AUTHTWO, editDetails);
router.delete("/:noteID", AUTHTWO, deleteNote);
router.delete("/userdelete/:noteID", AUTHTWOUSER, userDeleteCreatedNote);

router.get("/download/:filename", downloadNotes);
router.get("/read/:filename", ReadFileWithApp)
router.get("/search", AUTHTWOSTUDENT, search);
router.get("/usernote", AUTHTWOUSER, getUserNotes);
router.get("/usersearch", AUTHTWOUSER, userSearch);
router.get("/generalsearch", AUTHTWO, AUTHTWOUSER, AUTHTWOHOD, AUTHTWOSTUDENT, generalSearch);
router.get("/admingetall", AUTHTWO, getAllNoteAdmin);
router.delete('/admindeletenote/:noteID', AUTHTWO, deleteNoteAdmin);
router.get('/allactivatednote', AUTHTWO, getAllNoteAdminApproved);
router.get('/allnotactivatednote', AUTHTWO, getAllNoteAdminNotApproved);
router.patch('/activatenote/:noteID', AUTHTWO, approveNote);
router.patch("/blocknote/:noteID", AUTHTWO, blockNote)

router.get("/all-notes", getAllNotes);
router.get("/note/:noteID", singleNote);
router.get("/alllimit", getAllNotesWithoutLimit);

router.get('/allsubteach', AUTHTWOUSER, getAllSubjectTeacher)

router.get("/computer", getComputerNote);
router.get("/mathematics", getMathematicsNote);
router.get("/physics", getPhysics);
router.get("/chemistry", getChemistry);
router.get("/english", getEnglishLanguage);
router.get("/others", getOthers);

router.post('/scan', upload.single('file'), scan);



router.get("/admsci", AUTHTWO, getSciNoteAdmin);
router.get("/admart", AUTHTWO, getArtNoteAdmin);
router.get("/admlang", AUTHTWO, getLangNoteAdmin);
router.get("/admhum", AUTHTWO, getHumanNoteAdmin);
router.get("/admmth", AUTHTWO, getMathsNoteAdmin);
router.get("/admvoc", AUTHTWO, getVocationalNoteAdmin);



//HODS
router.get("/hodallnotes", AUTHTWOHOD, getAllScienceNote);
router.get("/hodallnotesapproved", AUTHTWOHOD, getAllScienceNoteApproved);
router.get("/hodallnotesnotapproved", AUTHTWOHOD, getAllScienceNoteNotApproved);
router.patch('/hodactivate/:noteID', AUTHTWOHOD, hodApproveNote);
router.patch("/hodblock/:noteID", AUTHTWOHOD, hodBlockNote);
router.delete("/hoddel/:noteID", AUTHTWOHOD, hodDeleteNote);

//get students notes
const {
    English,
    Mathematics,
    getAllSevenNote,
    getAllEightNote,
    getAllNineNote,
    getAllTenNote,
    getAllElevenNote,
    getAllTwelveNote,
    getStudentNote,
    assignCategory
} = require("../contollers/getnoteforclasses");


router.get("/classeng", AUTHTWOSTUDENT, English);
router.get("/classmaths", AUTHTWOSTUDENT, Mathematics);


router.get("/allseven", AUTHTWOSTUDENT, getAllSevenNote);
router.get("/alleight", AUTHTWOSTUDENT, getAllEightNote);
router.get("/allnine", AUTHTWOSTUDENT, getAllNineNote);
router.get("/allten", AUTHTWOSTUDENT, getAllTenNote);
router.get("/alleleven", AUTHTWOSTUDENT, getAllElevenNote);
router.get("/alltwelve", AUTHTWOSTUDENT, getAllTwelveNote);
router.get("/allnotes", AUTHTWOSTUDENT, getStudentNote);

router.patch("/assigncategory/:noteID", AUTHTWO, assignCategory);


module.exports = router;