const Note = require("../model/note");
const Student = require("../model/student");
const Admin = require("../model/admin");
const { BadrequestError, ConflictError, NotFoundError } = require("../error");

//MATHEMATICS
const Mathematics = async (req, res) => {
    const student = await Student.findById(req.student.id);
    let note = null
    if (student.studentClass === "Year 7") {
        note = await Note.find({ studentClass: "Year 8", subject: "Mathematics", approved: true })
    }
    if (student.studentClass === "Year 8") {
        note = await Note.find({ studentClass: "Year 8", subject: "Mathematics", approved: true })
    }
    if (student.studentClass === "Year 9") {
        note = await Note.find({ studentClass: "Year 9", subject: "Mathematics", approved: true })
    }
    if (student.studentClass === "Year 10") {
        note = await Note.find({ studentClass: "Year 10", subject: "Mathematics", approved: true })
    }
    if (student.studentClass === "Year 11") {
        note = await Note.find({ studentClass: "Year 11", subject: "Mathematics", approved: true })
    }
    if (student.studentClass === "Year 12") {
        note = await Note.find({ studentClass: "Year 12", subject: "Mathematics", approved: true })
    }

    if (note) {
        res.status(200).json(note)
    }
}

//ENGLISH
const English = async (req, res) => {
    const student = await Student.findById(req.student.id);
    let note = null
    if (student.studentClass === "Year 7") {
        note = await Note.find({ studentClass: "Year 8", subject: "English Language", approved: true })
    }
    if (student.studentClass === "Year 8") {
        note = await Note.find({ studentClass: "Year 8", subject: "English Language", approved: true })
    }
    if (student.studentClass === "Year 9") {
        note = await Note.find({ studentClass: "Year 9", subject: "English Language", approved: true })
    }
    if (student.studentClass === "Year 10") {
        note = await Note.find({ studentClass: "Year 10", subject: "English Language", approved: true })
    }
    if (student.studentClass === "Year 11") {
        note = await Note.find({ studentClass: "Year 11", subject: "English Language", approved: true })
    }
    if (student.studentClass === "Year 12") {
        note = await Note.find({ studentClass: "Year 12", subject: "English Language", approved: true })
    }

    if (note) {
        res.status(200).json(note)
    }
}

const getAllSevenNote = async (req, res) => {
    const student = await Student.findById(req.student.id);
    if (student.studentClass === "Year 7") {
        const note = await Note.find({
            studentClass: "Year 7",
            approved: true
        })
        if (note) {
            res.status(200).json(note)
        }
    }
}

const getAllEightNote = async (req, res) => {
    const student = await Student.findById(req.student.id);
    if (student.studentClass === "Year 8") {
        const note = await Note.find({
            studentClass: "Year 8",
            approved: true
        })
        if (note) {
            res.status(200).json(note)
        }
    }
}

const getAllNineNote = async (req, res) => {
    const student = await Student.findById(req.student.id);
    if (student.studentClass === "Year 9") {
        const note = await Note.find({
            studentClass: "Year 9",
            approved: true
        })
        if (note) {
            res.status(200).json(note)
        }
    }
}

const getAllTenNote = async (req, res) => {
    const student = await Student.findById(req.student.id);
    if (student.studentClass === "Year 10") {
        const note = await Note.find({
            studentClass: "Year 10",
            approved: true
        })
        if (note) {
            res.status(200).json(note)
        }
    }
}

const getAllElevenNote = async (req, res) => {
    const student = await Student.findById(req.student.id);
    if (student.studentClass === "Year 11") {
        const note = await Note.find({
            studentClass: "Year 11",
            approved: true
        })
        if (note) {
            res.status(200).json(note)
        }
    }
}

const getAllTwelveNote = async (req, res) => {
    const student = await Student.findById(req.student.id);
    if (student.studentClass === "Year 12") {
        const note = await Note.find({
            studentClass: "Year 12",
            approved: true
        })
        if (note) {
            res.status(200).json(note)
        }
    }
}

const getStudentNote = async (req, res) => {
    const student = await Student.findById(req.student.id);
    let note = null;
    if (student.studentClass === "Year 7") {
        note = await Note.find({
            studentClass: "Year 7",
            approved: true,
            category: student.category
        })
    }
    if (student.studentClass === "Year 8") {
        note = await Note.find({
            studentClass: "Year 8",
            approved: true,
            category: student.category
        })
    }
    if (student.studentClass === "Year 9") {
        note = await Note.find({
            studentClass: "Year 9",
            approved: true,
            category: student.category
        })
    }
    if (student.studentClass === "Year 10") {
        note = await Note.find({
            studentClass: "Year 10",
            approved: true,
            category: { $in: ["General", student.category] }
        })
    }

    if (student.studentClass === "Year 11") {
        note = await Note.find({
            studentClass: "Year 11",
            approved: true,
            category: { $in: ["General", student.category] }
        })
    }

    if (student.studentClass === "Year 12") {
        note = await Note.find({
            studentClass: "Year 12",
            approved: true,
            category: { $in: ["General", student.category] }
        })
    }
    if (note) {
        res.status(200).json(note)
    }
}

const assignCategory = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    const { category } = req.body;
    const { noteID } = req.params;
    const note = await Note.findById(noteID);

    if (!admin) {
        throw new BadrequestError("no admin was find with the provided id")
    }
    if (!note) {
        throw new NotFoundError("no note was found with the provided id...")
    }
    if (admin) {
        if (note.category === category) {
            throw new ConflictError(`the note is already assigned the category: ${category}`)
        } else {
            note.category = category;
            await note.save()
            const data = await Note.find({}).sort({ createdAt: -1 })
            res.status(200).json({ msg: `user has been assigned category: ${category}`, data: data })
        }
    }
}


module.exports = {
    Mathematics,
    English,
    getAllSevenNote,
    getAllEightNote,
    getAllNineNote,
    getAllTenNote,
    getAllElevenNote,
    getAllTwelveNote,
    getStudentNote,
    assignCategory
}