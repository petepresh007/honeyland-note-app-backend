const WPS = require("../model/wps");
const User = require("../model/user");
const { BadrequestError, ConflictError, NotFoundError, UnauthorizedError } = require("../error");
const path = require("path");
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, WrapSquare } = require('docx');
const Admin = require("../model/admin");
const Hod = require("../model/HOD");
const { deleteFile } = require("../middleware/deleteFiles");


const createWps = async (req, res) => {
    const { author, description, department, text, subject, topic } = req.body;
    const acceptedDepartment = [
        "Science",
        "Art",
        "Humanities",
        "Language"
    ]

    const acceptedSubject = [
        "Computer Science",
        "Mathematics",
        "English Language",
        "Physics",
        "Chemistry",
        "Others"
    ]
    if (!author || !description || !acceptedDepartment.includes(department) || !text || !acceptedSubject.includes(subject) || !topic) {
        throw new BadrequestError("all fields are required...");
    }
    const user = await User.findById(req.user.id);

    if (user) {
        const existingWps = await WPS.findOne({ text, description });
        if (existingWps) {
            throw new ConflictError("note already exists")
        }
        const randval = Math.floor(Math.random() * 1e9) + "-" + "file.docx"
        const filepath = path.join(__dirname, "..", "upload", randval);

        // Create a new Document
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text,
                                size: 24,
                            }),
                        ],
                    }),
                ],
            }],
        });

        // Pack the document into a buffer
        const buffer = await Packer.toBuffer(doc);

        if (!fs.existsSync(filepath)) {
            fs.writeFile(filepath, buffer, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }

        const createdNote = new WPS({
            author,
            description,
            department,
            text,
            filename: randval,
            subject,
            topic,
            createdBy: req.user.id
        });
        await createdNote.save()
        res.status(200).json({ msg: "wps created successfully..." })
    }
}



//approve and block note
const approveNote = async (req, res) => {
    const { noteID } = req.params;
    const admin = await Admin.findById(req.admin.id);


    const note = await WPS.findById(noteID);


    if (!note) {
        throw new NotFoundError("note has been deleted or user does not exists");
    }

    if (admin) {
        if (note.approved === true) {
            throw new ConflictError("user has already been approved");
        } else {
            note.approved = true;
            note.approvedBy = req.admin.username;
            await note.save();

            const notedataApproved = await WPS.find({ approved: true })
            const notedataNotApproved = await WPS.find({ approved: false })
            res.status(200).json({ msg: "activated successfully", dataApproved: notedataApproved, dataNotApproved: notedataNotApproved });
        }
    }
}

const blockNote = async (req, res) => {
    const { noteID } = req.params;
    const admin = await Admin.findById(req.admin.id);
    const note = await WPS.findById(noteID);
    if (!note) {
        throw new NotFoundError("user has been deleted or user does not exists")
    }

    if (admin) {
        if (note.approved === false) {
            throw new ConflictError("user has been blocked already");
        } else {
            note.approved = false;
            note.approvedBy = req.admin.username;
            await note.save();
            const notedataApproved = await WPS.find({ approved: true })
            const notedataNotApproved = await WPS.find({ approved: false })
            res.status(200).json({ msg: "deactivated..", dataApproved: notedataApproved, dataNotApproved: notedataNotApproved });
        }
    }
}


const hodApproveNote = async (req, res) => {
    const { noteID } = req.params;
    const hod = await Hod.findById(req.hod.id);


    const note = await WPS.findById(noteID);


    if (!note) {
        throw new NotFoundError("note has been deleted or user does not exists");
    }

    if (hod) {
        if (note.approved === true) {
            throw new ConflictError("user has already been approved");
        } else {
            note.approved = true;
            note.approvedBy = req.hod.username;
            await note.save();

            let notedataApproved = null;
            let notedataNotApproved = null;

            if (hod.department === "Science") {
                notedataApproved = await WPS.find({ approved: true, department: "Science" })
                notedataNotApproved = await WrapSquare.find({ approved: false, department: "Science" })
            }
            if (hod.department === "Art") {
                notedataApproved = await WPS.find({ approved: true, department: "Art" })
                notedataNotApproved = await WPS.find({ approved: false, department: "Art" })
            }
            if (hod.department === "Humanities") {
                notedataApproved = await WPS.find({ approved: true, department: "Humanities" })
                notedataNotApproved = await WPS.find({ approved: false, department: "Humanities" })
            }
            if (hod.department === "Language") {
                notedataApproved = await WPS.find({ approved: true, department: "Language" })
                notedataNotApproved = await WPS.find({ approved: false, department: "Language" })
            }

            res.status(200).json({ msg: "activated successfully", dataApproved: notedataApproved, dataNotApproved: notedataNotApproved });
        }
    }
}

const hodBlockNote = async (req, res) => {
    const { noteID } = req.params;
    const hod = await Hod.findById(req.hod.id);
    const note = await WPS.findById(noteID);



    if (!note) {
        throw new NotFoundError("user has been deleted or user does not exists")
    }

    if (hod) {
        if (note.approved === false) {
            throw new ConflictError("user has been blocked already");
        } else {
            note.approved = false;
            note.approvedBy = req.hod.username;
            await note.save();

            let notedataApproved = null;
            let notedataNotApproved = null;

            if (hod.department === "Science") {
                notedataApproved = await WPS.find({ approved: true, department: "Science" })
                notedataNotApproved = await WPS.find({ approved: false, department: "Science" })
            }
            if (hod.department === "Art") {
                notedataApproved = await WPS.find({ approved: true, department: "Art" })
                notedataNotApproved = await WPS.find({ approved: false, department: "Art" })
            }
            if (hod.department === "Humanities") {
                notedataApproved = await WPS.find({ approved: true, department: "Humanities" })
                notedataNotApproved = await WPS.find({ approved: false, department: "Humanities" })
            }
            if (hod.department === "Language") {
                notedataApproved = await WPS.find({ approved: true, department: "Language" })
                notedataNotApproved = await WPS.find({ approved: false, department: "Language" })
            }

            res.status(200).json({ msg: "deactivated..", dataApproved: notedataApproved, dataNotApproved: notedataNotApproved });
        }
    }
}


const deleteWpsHodAdmin = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    const { noteID } = req.params;
    const note = await WPS.findById(noteID);

    if (!note) {
        throw new NotFoundError("No note was found with the provided id...")
    }
    if (admin) {
        adminDel = await WPS.findOneAndRemove({ _id: noteID })
        if (adminDel) {
            const filepath = path.join(__dirname, "..", "upload", note.filename);
            if (fs.existsSync(filepath)) {
                deleteFile(filepath)
            }
        }
        res.status(200).json({ msg: `note deleted successfully...` })
    }
}

const hodDeleteNote = async (req, res) => {
    const hod = await Hod.findById(req.hod.id);
    const { noteID } = req.params;

    const note = await WPS.findById(noteID);
    let hodDel = null;

    if (!note) {
        throw new NotFoundError("No note was found with the provided id...")
    }

    if (hod.department === "Science") {
        hodDel = await WPS.findOneAndRemove({ _id: noteID, department: "Science" })
    }

    if (hod.department === "Humanities") {
        hodDel = await WPS.findOneAndRemove({ _id: noteID, department: "Humanities" })
    }

    if (hod.department === "Art") {
        hodDel = await WPS.findOneAndRemove({ _id: noteID, department: "Art" })
    }

    if (hod.department === "Language") {
        hodDel = await WPS.findOneAndRemove({ _id: noteID, department: "Language" })
    }

    if (hodDel) {
        const filepath = path.join(__dirname, "..", "upload", note.filename);
        if (fs.existsSync(filepath)) {
            deleteFile(filepath)
        }
        res.status(200).json({ msg: `note deleted successfully...` })
    } else {
        throw new UnauthorizedError("you are not authorized to delete this note")
    }
}

const userDeleteNote = async (req, res) => {
    const user = await User.findById(req.user.id);
    const { noteID } = req.params;
    const note = await WPS.findById(noteID);

    if (!note) {
        throw new NotFoundError("No note was found with the provided id...")
    }

    if (user) {
        userDel = await WPS.findOneAndRemove({ _id: noteID, createdBy: req.user.id, approved: false })
        if (userDel) {
            const filepath = path.join(__dirname, "..", "upload", note.filename);
            if (fs.existsSync(filepath)) {
                deleteFile(filepath)
            }
            res.status(200).json({ msg: `note deleted successfully...` })
        } else {
            throw new UnauthorizedError("you are not authorized to delete this note")
        }
    }

}

const getAllNoteHod = async (req, res) => {
    const hod = await Hod.findById(req.hod.id);
    let note = null;

    if (hod.department === "Science") {
        note = await WPS.find({ department: "Science" })
    }

    if (hod.department === "Art") {
        note = await WPS.find({ department: "Art" })
    }

    if (hod.department === "Humanities") {
        note = await WPS.find({ department: "Humanities" })
    }

    if (hod.department === "Language") {
        note = await WPS.find({ department: "Language" })
    }

    if (note) {
        res.status(200).json(note)
    }
}

const getAllUserNote = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new NotFoundError("No user was found with the provided id")
    } else {
        const allnote = await WPS.find({ createdBy: req.user.id });
        if(allnote){
            res.status(201).json(allnote);
        }
    }
}

const getAllUserAdmin = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("No admin was found with the provided id")
    } else {
        const allnote = await WPS.find({});
        if (allnote) {
            res.status(201).json(allnote);
        }
    }
}

module.exports = {
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
}