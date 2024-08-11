const Note = require("../model/note");
const { join } = require("path");
const { readFile } = require("fs");
const { NotFoundError, BadrequestError, ConflictError, UnauthorizedError } = require("../error");
const mime = require('mime');
const fs = require('fs');
const Admin = require("../model/admin");
const { deleteFile } = require("../middleware/deleteFiles");
const User = require("../model/user");
const path = require("path");
const officeparser = require("officeparser");
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

const Student = require("../model/student");
const Hod = require("../model/HOD");


const createNote = async (req, res) => {
    /**GET ALL NOTES */
    const admin = await Admin.findById(req.admin.id);

    const acceptedSubject = [
        "Computer Science",
        "Mathematics",
        "English Language",
        "Physics",
        "Chemistry",
        "Agriculture Science",
        "Basic Technology",
        "Basic Science",
        "Business Studies",
        "Cultural and Creative Art",
        "Civic Education",
        "French Language",
        "History",
        "Home  Economics",
        "PHE",
        "Social Studies",
        "Yoruba",
        "ICT",
        "Biology",
        "Further Mathematics",
        "Technical Drawing",
        "Foods and Nutrition",
        "CRS",
        "IRS",
        "Visual Art",
        "Geography",
        "Government",
        "Economics",
        "Literature in English",
        "Financial Accounting",
        "Commerce",
        "Painting & Decoration",
        "Catering Craft",
        "Data Processing",
        "Marketting",
        "Others"
    ]

    const acceptedDepartment = [
        "Science",
        "Social Science",
        "Humanities",
        "Language",
        "Mathematics",
        "Vocational"
    ]

    const allowedclass = [
        "Year 7",
        "Year 8",
        "Year 9",
        "Year 10",
        "Year 11",
        "Year 12"
    ]

    if (admin) {
        const { author, description, department, subject, topic, studentClass } = req.body;
        /**CHECK FOR EMPTY FIELD*/
        if (!author || !description || !subject || !topic || !acceptedSubject.includes(subject) || !acceptedDepartment.includes(department) || !allowedclass.includes(studentClass)) {
            if (req.file) {
                const filepath = join(__dirname, "..", "upload", req.file.filename);
                if (fs.existsSync(filepath)) {
                    deleteFile(filepath)
                }
            }
            throw new BadrequestError("All fields are required, make sure you are entering the right value for category field");
        }
        if (!req.file) {
            throw new BadrequestError("please upload the required note")
        }

        const filename = req.file.filename;
        const fileUrl = join(filename);

        /**CHECK IF FILE EXISTS */
        const existingNote = await Note.findOne({ description, department });
        if (existingNote) {
            const filepath = join(__dirname, "..", "upload", req.file.filename);
            deleteFile(filepath);
            throw new ConflictError("Note already exists");
        }

        const note = new Note(
            {
                author,
                description,
                department,
                file: fileUrl,
                subject,
                topic,
                studentClass,
                createdBy: admin._id
            }
        );
        if (!note) {
            throw new BadrequestError("Something went wrong...");
        }
        await note.save();
        return res.status(201).json({ msg: "file uploaded successfully...", note });
    }
}



const readAllnotes = async (req, res) => {
    const notes = await Note.find({ createdBy: req.user.userID });

    // Create an array to store the promises for file reading
    const fileReadingPromises = [];

    notes.forEach((note) => {
        const { author, description, file } = note;

        // Create a promise for each file reading operation
        const promise = new Promise((resolve, reject) => {
            readFile(`../backend/upload/${file}`, "utf-8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err); // Reject the promise in case of an error
                } else {
                    resolve({ author, description, note: data, file }); // Resolve with the file data
                }
            });
        });

        fileReadingPromises.push(promise);
    });

    // Wait for all file reading promises to complete
    Promise.all(fileReadingPromises)

        .then((results) => {
            // Send the response with all the file data
            return res.status(200).json(results);
        })
        .catch((error) => {
            // Handle any errors that occurred during file reading
            return res.status(500).json({ error: `An error occurred during file reading. ${error}` });
        });
}

const readSingleNote = async (req, res) => {
    try {
        const { user: { userID }, params: { id } } = req
        const notes = await Note.find({ createdBy: userID, _id: id });
        /**READING A SINGLE NOTE */

        if (notes) {
            notes.map((note) => {
                const { author, description, file } = note;
                readFile(`../backend/upload/${file}`, "utf-8", (err, data) => {
                    if (err) {
                        console.log(err);
                    }
                    return res.status(200).json({ msg: { author: author, description: description, note: data, file } });
                });
            })
        }
    } catch (error) {
        res.status(500).json({ msg: "internal server error" })
    }
}


/**GET NOTES */
const getAllNotes = async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const getData = await Note.find({ approved: true }).select("-__v").limit(limit).sort({ createdAt: -1 });
    if (getData) {
        res.status(200).json(getData)
    }
}
/***ALLLL NOTES WITH NO LIMIT */
const getAllNotesWithoutLimit = async (req, res) => {
    const getData = await Note.find({ approved: true }).select("-__v").sort({ createdAt: -1 });;
    if (getData) {
        res.status(200).json(getData)
    }
}



/**GET SINGLE NOTE */
const singleNote = async (req, res) => {
    const { noteID } = req.params
    const getNotes = await Note.find({ _id: noteID }).select("-__v");
    if (getNotes) {
        res.status(200).json(getNotes)
    }
}

/**EDIT SUBMITTED NOTE */
const editDetails = async (req, res) => {
    try {
        const { admin: { id }, params: { noteID }, body: { author, description, category } } = req;

        const admin = await Admin.findById(id);
        if (!admin) {
            throw new NotFoundError("No admin was found with the provided id")
        }

        const files = req.file;
        let fileUrl = null;

        if (files) {
            fileUrl = join(files.filename)
        }

        const selectedNote = await Note.findById(noteID);
        if (!selectedNote) {
            throw new NotFoundError("No note with the id was found")
        }

        if (admin) {
            const updatedUser = await Note.findByIdAndUpdate(
                {
                    createdBy: id,
                    _id: noteID
                },
                {
                    author: author ? author : selectedNote.author,
                    description: description ? description : selectedNote.description,
                    file: files ? fileUrl : selectedNote.file,
                    category: category ? category : selectedNote.category
                }
            );

            if (!updatedUser) {
                throw new NotFoundError(`No user was found with the userID ${id}`);
            }
            const filepath = join(__dirname, "..", "upload", selectedNote.file);
            files && deleteFile(filepath)
            return res.status(200).json({ msg: `user has been updated successfully...` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "internal server error" });
    }
}


/**DELETE SINGLE NOTE */
const deleteNote = async (req, res) => {
    try {
        const { admin: { id }, params: { noteID } } = req;
        const admin = await Admin.findById(id);

        if (!admin) {
            throw new NotFoundError("No admin with the id provided")
        }

        if (admin) {
            const deleteUserNote = await Note.deleteOne({ createdBy: id, _id: noteID });
            if (!deleteUserNote) {
                throw new NotFoundError(`No user found with the id ${id}`)
            }
            const filepath = join(__dirname, "..", "upload", existingNote.file);
            deleteFile(filepath)
            res.status(200).json({ msg: `user with userID ${id} has been deleted successfully...` })
        }
    } catch (error) {
        res.status(500).json({ msg: `internal server error` });
    }
}


/**DOWNLOAD NOTES */
const downloadNotes = async (req, res) => {
    const { filename } = req.params;
    const file = path.join(__dirname, "..", 'upload', filename);

    // Check if the file exists
    if (fs.existsSync(file)) {
        // Get the MIME type for the file
        const mimeType = mime.getType(filename);

        // Set the appropriate content type for the file
        res.setHeader('Content-Type', mimeType || 'application/octet-stream');
        // Set the file's name for download
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        // Stream the file to the response
        const fileStream = fs.createReadStream(file);
        fileStream.pipe(res);
    } else {
        // If the file doesn't exist, return a 404 error
        res.status(404).send('File not found');
    }
}

/**OPEN FILE */
async function ReadFileWithApp(req, res) {
    const { filename } = req.params;
    const filePath = join(__dirname, "..", 'upload', filename);

    if (fs.existsSync(filePath)) {
        // Determine appropriate MIME type based on file extension
        let mimeType = 'application/octet-stream';
        if (filename.endsWith('.pdf')) {
            mimeType = 'application/pdf';
        } else if (filename.endsWith('.docx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Set appropriate headers and send the file
        res.setHeader('Content-Type', mimeType);
        //res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Disposition', 'inline');
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.status(404).send('File not found');
    }
}

/**SEARCH ALGORITHM */
async function search(req, res) {
    // const admin = await Admin.findById(req.admin.id);
    // const user = await User.findById(req.user.id);
    // const hod = await Hod.findById(req.hod.id);
    const student = await Student.findById(req.student.id);



    const topic = req.query.topic;
    const regex = new RegExp(topic, "i");
    if (student) {
        try {
            const notes = await Note.find({ topic: { $regex: regex }, approved: true });
            res.json(notes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};



/**AVAILABLE SUBJECT*/
const getComputerNote = async (req, res) => {
    const getData = await Note.find({ subject: "Computer Science", approved: true })
        .select("-__v")
        .sort({ createdAt: -1 });;
    if (getData) {
        res.status(200).json(getData)
    }
}

const getMathematicsNote = async (req, res) => {
    const getData = await Note.find({ subject: "Mathematics", approved: true })
        .select("-__v")
        .sort({ createdAt: -1 });;
    if (getData) {
        res.status(200).json(getData)
    }
}

const getEnglishLanguage = async (req, res) => {
    const getData = await Note.find({ subject: "English Language", approved: true })
        .select("-__v")
        .sort({ createdAt: -1 });;
    if (getData) {
        res.status(200).json(getData)
    }
}

const getChemistry = async (req, res) => {
    const getData = await Note.find({ subject: "Chemistry", approved: true })
        .select("-__v")
        .sort({ createdAt: -1 });;
    if (getData) {
        res.status(200).json(getData)
    }
}

const getPhysics = async (req, res) => {
    const getData = await Note.find({ subject: "Physics", approved: true })
        .select("-__v")
        .sort({ createdAt: -1 });;
    if (getData) {
        res.status(200).json(getData)
    }
}
const getOthers = async (req, res) => {
    const getData = await Note.find({ subject: "Others", approved: true })
        .select("-__v")
        .sort({ createdAt: -1 });;
    if (getData) {
        res.status(200).json(getData)
    }
}


const userCreateNote = async (req, res) => {
    /**GET ALL NOTES */
    const user = await User.findById(req.user.id);
    //console.log(user)

    const acceptedSubject = [
        "Computer Science",
        "Mathematics",
        "English Language",
        "Physics",
        "Chemistry",
        "Agriculture Science",
        "Basic Technology",
        "Basic Science",
        "Business Studies",
        "Cultural and Creative Art",
        "Civic Education",
        "French Language",
        "History",
        "Home  Economics",
        "PHE",
        "Social Studies",
        "Yoruba",
        "ICT",
        "Biology",
        "Further Mathematics",
        "Technical Drawing",
        "Foods and Nutrition",
        "CRS",
        "IRS",
        "Visual Art",
        "Geography",
        "Government",
        "Economics",
        "Literature in English",
        "Financial Accounting",
        "Commerce",
        "Painting & Decoration",
        "Catering Craft",
        "Data Processing",
        "Marketting",
        "Others"
    ]

    const acceptedDepartment = [
        "Science",
        "Social Science",
        "Humanities",
        "Language",
        "Mathematics",
        "Vocational"
    ]

    const allowedclass = [
        "Year 7",
        "Year 8",
        "Year 9",
        "Year 10",
        "Year 11",
        "Year 12"
    ]

    if (user) {
        const { /**author,*/ description, /**subject,*/ topic, studentClass } = req.body;
        /**CHECK FOR EMPTY FIELD*/
        if (/**author ||*/ !description || /**!subject ||*/ !topic /**|| !acceptedSubject.includes(subject)*/ || !allowedclass.includes(studentClass)) {
            if (req.file) {
                const filepath = join(__dirname, "..", "upload", req.file.filename);
                if (fs.existsSync(filepath)) {
                    deleteFile(filepath)
                }
            }
            throw new BadrequestError("All fields are required, make sure you are entering the correct value for the subject field")
        }

        if (!acceptedSubject.includes(user.subject)) {
            if (req.file) {
                const filepath = join(__dirname, "..", "upload", req.file.filename);
                if (fs.existsSync(filepath)) {
                    deleteFile(filepath)
                }
            }
            throw new BadrequestError("P")
        }

        if (!req.file) {
            throw new BadrequestError("please, upload the note...")
        }

        const filename = req.file.filename;
        const fileUrl = join(filename);
        `   `
        /**CHECK IF FILE EXISTS */
        const existingNote = await Note.findOne({ description, topic });
        if (existingNote) {
            const filepath = join(__dirname, "..", "upload", req.file.filename);
            deleteFile(filepath);
            throw new ConflictError("Note already exists");
        }

        const note = new Note(
            {
                author: `${user.firstname} ${user.lastname}`,
                description,
                department: user.department,
                file: fileUrl,
                subject: user.subject,
                topic,
                studentClass,
                category: user.category,
                createdBy: user._id
            }
        );
        if (!note) {
            throw new BadrequestError("Something went wrong...");
        }
        await note.save();
        return res.status(201).json({ msg: "file uploaded successfully...", note });
    }
}

const getUserNotes = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        const note = await Note.find({ createdBy: req.user.id }).select("-__v");
        if (note) {
            res.status(200).json(note)
        }
    }
}


/**user Search**/
async function userSearch(req, res) {
    const topic = req.query.topic;
    const regex = new RegExp(topic, "i");
    try {
        const notes = await Note.find({ createdBy: req.user.id, topic: { $regex: regex } });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


/**USER DELETE HIS CREATED NOTE LOL */
async function userDeleteCreatedNote(req, res) {
    const { noteID } = req.params;
    const user = await User.findById(req.user.id);
    const note = await Note.findOne({ _id: noteID, createdBy: req.user.id })

    if (!user) {
        throw new NotFoundError("No user was found with the provided id..");
    }

    if (!note) {
        throw new NotFoundError("No note was found...")
    }

    if (user) {
        if (!note.approved) {
            const deleteNote = await Note.findOneAndDelete({
                _id: noteID,
                createdBy: req.user.id
            },
                { new: true }).select("-__v");

            if (deleteNote) {
                const filePath = path.join(__dirname, "..", "upload", note.file)
                if (fs.existsSync(filePath)) {
                    deleteFile(filePath)
                }
                const returnD = await Note.find({ createdBy: req.user.id })
                res.status(200).json({ msg: "note delected successfully...", data: returnD })
            }
        } else {
            throw new BadrequestError("Your note has been approved and can't be deleted by you..")
        }
    }
}

/**USER EDIT CREATED NOTE LOL */
async function editCreatedNoteByUser(req, res) {
    const { noteID } = req.params;
    const user = await User.findById(req.user.id);
    const note = await Note.findOne({ _id: noteID, createdBy: req.user.id })
    const { author, description, subject, topic } = req.body

    if (!user) {
        throw new NotFoundError("No user was found with the provided id..");
    }

    if (!note) {
        throw new NotFoundError("No note was found...")
    }
    if (!author && !description && !req.file && !subject && !topic) {
        throw new BadrequestError("Please, enter a field to update...")
    }


    if (user) {
        if (!note.approved) {
            const modifyNote = await Note.findOneAndUpdate({
                _id: noteID,
                createdBy: req.user.id
            },
                {
                    author: author ? author : note.author,
                    description: description ? description : note.description,
                    file: req.file ? req.file.filename : note.file,
                    subject: subject ? subject : note.subject,
                    topic: topic ? topic : note.topic,
                    createdBy: req.user.id
                },
                { new: true }
            ).select("-__v");

            if (modifyNote) {
                if (req.file) {
                    const filePath = path.join(__dirname, "..", "upload", note.file);
                    if (fs.existsSync(filePath)) {
                        deleteFile(filePath);
                    }
                }

                const returnD = await Note.find({ createdBy: req.user.id });
                res.status(200).json({ msg: "note updated successfully...", data: returnD })
            }
        } else {
            throw new BadrequestError("Your note has been approved and can't be modified by you..")
        }
    }
}


const generalSearch = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    const student = await Student.findById(req.student.id);
    const user = await User.findById(req.user.id);
    const hod = await Hod.findById(req.hod.id)


    if (!admin) {
        throw new NotFoundError(`sorry no admin was found with the supplied id`)
    }
    if (!student) {
        throw new NotFoundError(`sorry no student was found with the supplied id`)
    }
    if (!user) {
        throw new NotFoundError(`sorry no user was found with the supplied id`)
    }

    if (!hod) {
        throw new NotFoundError(`sorry no user was found with the supplied id`)
    }


    const { query } = req.query;
    let searchCriteria = {};

    //if (student) {
    if (query) {
        const regex = new RegExp(query, "i");
        searchCriteria = {
            $or: [
                { topic: { $regex: regex }, approved: true },
                { description: { $regex: regex }, approved: true },
                { author: { $regex: regex }, approved: true },
                { subject: { $regex: regex }, approved: true },
            ]
        };
    }

    try {
        const notes = await Note.find(searchCriteria);
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
    // } else {
    //     throw new UnauthorizedError("You need to login to access notes")
    // }

}


/**get all notes by admin */
async function getAllNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({}).select("-__v").sort({ createdAt: -1 });
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}

async function getSciNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ department: "Science" })
            .select("-__v")
            .sort({ createdAt: -1 });
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}

async function getArtNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ department: "Social Science" })
            .select("-__v")
            .sort({ createdAt: -1 });
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}

async function getLangNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ department: "Language" })
            .select("-__v")
            .sort({ createdAt: -1 });
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}

async function getHumanNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ department: "Humanities" })
            .select("-__v")
            .sort({ createdAt: -1 });
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}

async function getMathsNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ department: "Mathematics" })
            .select("-__v")
            .sort({ createdAt: -1 });
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}


async function getVocationalNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ department: "Vocational" })
            .select("-__v")
            .sort({ createdAt: -1 });
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}
/**get all notes by admin */


/**delete all notes */
async function deleteNoteAdmin(req, res) {
    const admin = await Admin.findById(req.admin.id);
    const { noteID } = req.params;
    const note = await Note.findById(noteID)

    if (!admin) {
        throw new NotFoundError("No admin was found with the supplied id");
    }

    if (!note) {
        throw new NotFoundError("No note was found with the supplied id");
    }

    if (admin) {
        const deleteNote = await Note.findByIdAndRemove(noteID, { new: true });
        if (deleteNote) {
            const filePath = path.join(__dirname, "..", "upload", note.file);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath)
            }
            const noteData = await Note.find({}).select("-__v")
                .sort({ createdAt: -1 })
            const notedataApproved = await Note.find({ approved: true });
            const notedataNotApproved = await Note.find({ approved: false });
            res.status(200).json({ msg: "note deleted successfully", data: noteData, dataApproved: notedataApproved, dataNotApproved: notedataNotApproved });
        }
    }
}

/**get approved */
async function getAllNoteAdminApproved(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ approved: true }).select("-__v");
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}

/**get not approved */
async function getAllNoteAdminNotApproved(req, res) {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
        const allnote = await Note.find({ approved: false }).select("-__v");
        if (allnote) {
            res.status(200).json(allnote);
        }
    }
}



const approveNote = async (req, res) => {
    const { noteID } = req.params;
    const admin = await Admin.findById(req.admin.id);


    const note = await Note.findById(noteID);


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

            const notedataApproved = await Note.find({ approved: true })
            const notedataNotApproved = await Note.find({ approved: false })
            const data = await Note.find({})
                .sort({ createdAt: -1 })
            res.status(200).json({
                msg: "activated successfully",
                dataApproved: notedataApproved,
                dataNotApproved: notedataNotApproved,
                data: data
            });
        }
    }
}

const blockNote = async (req, res) => {
    const { noteID } = req.params;
    const admin = await Admin.findById(req.admin.id);
    const note = await Note.findById(noteID);
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
            const notedataApproved = await Note.find({ approved: true })
            const notedataNotApproved = await Note.find({ approved: false })
            const data = await Note.find({})
                .sort({ createdAt: -1 })
            res.status(200).json({
                msg: "deactivated..",
                dataApproved: notedataApproved,
                dataNotApproved: notedataNotApproved,
                data: data
            });
        }
    }
}




//scan note
// const analyzePDF = async (filePath) => {
//     const fileBuffer = fs.readFileSync(filePath);
//     const pdfDoc = await PDFDocument.load(fileBuffer);
//     const pages = pdfDoc.getPages();
//     console.log(pages)

//     const analysisResults = pages.map(page => {
//         const { width, height } = page.getSize();
//         const textContent = page.getTextContent();

//         const analysis = textContent.items.map(item => ({
//             text: item.str,
//             fontSize: item.height,
//             fontName: item.fontName,
//             lineSpacing: item.transform[5] - item.transform[1]
//         }));

//         return { width, height, analysis };
//     });

//     return { pages: analysisResults };
// };


// const analyzePDF = async (filePath) => {
//     const fileBuffer = fs.readFileSync(filePath);
//     const data = await pdfParse(fileBuffer);

//     const text = data.text;
//     // Perform additional analysis on the extracted text
//     return { text };
// };

const analyzePDF = async (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    console.log(pages)

    const analysisResults = [];

    for (const page of pages) {
        const { width, height } = page.getSize();
        const textItems = await page.getTextContent();
        const analysis = textItems.items.map(item => ({
            text: item.str,
            fontSize: item.height,
            fontName: item.fontName,
            lineSpacing: item.transform[5] - item.transform[1]
        }));

        analysisResults.push({ width, height, analysis });
    }

    return { pages: analysisResults };
};

const analyzeWord = async (filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;
    // Add your logic to analyze text for font size, font style, and line spacing
    return { text };
};

// const analyzePowerPoint = async (filePath) => {
//     return new Promise((resolve, reject) => {
//         officeParser.parseOfficeAsync(filePath, (err, data) => {
//             if (err) return reject(err);
//             // Add your logic to analyze data for font size, font style, and line spacing
//             resolve({ slides: data });
//         });
//     });
// };

const scan = async (req, res) => {
    // const filePath = path.join(__dirname, req.file.path);
    const filePath = path.join(__dirname, '..', req.file.path)

    try {
        let result;
        const fileType = req.file.mimetype;

        if (fileType === 'application/pdf') {
            result = await analyzePDF(filePath);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            result = await analyzeWord(filePath);
        }/**else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            result = await analyzePowerPoint(filePath);
        } **/else {
            throw new Error('Unsupported file type');
        }

        fs.unlinkSync(filePath);

        res.json(result);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
};



//HOD DEPARTMENTS
const getAllScienceNote = async (req, res) => {
    const hod = await Hod.findById(req.hod.id);
    if (!hod) {
        throw new NotFoundError("No hod was found with the supplied id...")
    }
    let getData = null;

    if (hod.department === "Science") {
        getData = await Note.find({ department: "Science" })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Humanities") {
        getData = await Note.find({ department: "Humanities" })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Social Science") {
        getData = await Note.find({ department: "Social Science" })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    if (hod.department === "Language") {
        getData = await Note.find({ department: "Language" })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Mathematics") {
        getData = await Note.find({ department: "Mathematics" })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Vocational") {
        getData = await Note.find({ department: "Vocational" })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    res.status(200).json(getData);
}


const getAllScienceNoteNotApproved = async (req, res) => {
    const hod = await Hod.findById(req.hod.id);
    if (!hod) {
        throw new NotFoundError("No hod was found with the supplied id...")
    }
    let getData = null;

    if (hod.department === "Science") {
        getData = await Note.find({ department: "Science", approved: false })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Humanities") {
        getData = await Note.find({ department: "Humanities", approved: false })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Social Science") {
        getData = await Note.find({ department: "Social Science", approved: false })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    if (hod.department === "Language") {
        getData = await Note.find({ department: "Language", approved: false })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Mathematics") {
        getData = await Note.find({ department: "Mathematics", approved: false })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Vocational") {
        getData = await Note.find({ department: "Vocational", approved: false })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    res.status(200).json(getData)
}



const getAllScienceNoteApproved = async (req, res) => {
    const hod = await Hod.findById(req.hod.id);
    if (!hod) {
        throw new NotFoundError("No hod was found with the supplied id...")
    }
    let getData = null;

    if (hod.department === "Science") {
        getData = await Note.find({ department: "Science", approved: true })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Humanities") {
        getData = await Note.find({ department: "Humanities", approved: true })
            .select("-__v")
            .sort({ createdAt: -1 })
    }
    if (hod.department === "Social Science") {
        getData = await Note.find({ department: "Social Science", approved: true })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    if (hod.department === "Language") {
        getData = await Note.find({ department: "Language", approved: true })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    if (hod.department === "Mathematics") {
        getData = await Note.find({ department: "Mathematics", approved: true })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    if (hod.department === "Vocational") {
        getData = await Note.find({ department: "Vocational", approved: true })
            .select("-__v")
            .sort({ createdAt: -1 })
    }

    res.status(200).json(getData)
}

const hodApproveNote = async (req, res) => {
    const { noteID } = req.params;
    const hod = await Hod.findById(req.hod.id);


    const note = await Note.findById(noteID);


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
            let getNote = null;


            if (hod.department === "Science") {
                notedataApproved = await Note.find({ approved: true, department: "Science" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Science" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Science" })
                    .sort({ createdAt: -1 });
            }
            if (hod.department === "Social Science") {
                notedataApproved = await Note.find({ approved: true, department: "Social Science" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Social Science" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Social Science" })
                    .sort({ createdAt: -1 });
            }
            if (hod.department === "Humanities") {
                notedataApproved = await Note.find({ approved: true, department: "Humanities" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Humanities" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Humanities" })
                    .sort({ createdAt: -1 });
            }
            if (hod.department === "Language") {
                notedataApproved = await Note.find({ approved: true, department: "Language" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Language" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Language" })
                    .sort({ createdAt: -1 });
            }

            if (hod.department === "Mathematics") {
                notedataApproved = await Note.find({ approved: true, department: "Mathematics" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Mathematics" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Mathematics" })
                    .sort({ createdAt: -1 });
            }

            if (hod.department === "Vocational") {
                notedataApproved = await Note.find({ approved: true, department: "Vocational" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Vocational" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Vocational" })
                    .sort({ createdAt: -1 });
            }


            res.status(200).json({ msg: "activated successfully", dataApproved: notedataApproved, dataNotApproved: notedataNotApproved, note: getNote });
        }
    }
}

const hodBlockNote = async (req, res) => {
    const { noteID } = req.params;
    const hod = await Hod.findById(req.hod.id);
    const note = await Note.findById(noteID);


    if (!note) {
        throw new NotFoundError("user has been deleted or user does not exists")
    }

    if (hod) {
        if (note.approved === false) {
            throw new ConflictError("note has been blocked already");
        } else {
            note.approved = false;
            note.approvedBy = req.hod.username;
            await note.save();

            let notedataApproved = null;
            let notedataNotApproved = null;
            let getNote = null;

            if (hod.department === "Science") {
                notedataApproved = await Note.find({ approved: true, department: "Science" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Science" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Science" })
                    .sort({ createdAt: -1 });
            }
            if (hod.department === "Social Science") {
                notedataApproved = await Note.find({ approved: true, department: "Social Science" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Social Science" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Social Science" })
                    .sort({ createdAt: -1 });
            }
            if (hod.department === "Humanities") {
                notedataApproved = await Note.find({ approved: true, department: "Humanities" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Humanities" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Humanities" })
                    .sort({ createdAt: -1 });
            }

            if (hod.department === "Language") {
                notedataApproved = await Note.find({ approved: true, department: "Language" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Language" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Language" })
                    .sort({ createdAt: -1 });
            }

            if (hod.department === "Mathematics") {
                notedataApproved = await Note.find({ approved: true, department: "Mathematics" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Mathematics" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Mathematics" })
                    .sort({ createdAt: -1 });
            }

            if (hod.department === "Vocational") {
                notedataApproved = await Note.find({ approved: true, department: "Vocational" })
                    .sort({ createdAt: -1 });
                notedataNotApproved = await Note.find({ approved: false, department: "Vocational" })
                    .sort({ createdAt: -1 });
                getNote = await Note.find({ department: "Vocational" })
                    .sort({ createdAt: -1 });
            }

            res.status(200).json({ msg: "deactivated..", dataApproved: notedataApproved, dataNotApproved: notedataNotApproved, note: getNote });
        }
    }
}


const hodDeleteNote = async (req, res) => {
    const { hod: { id }, params: { noteID } } = req;
    const hod = await Hod.findById(id);

    if (!hod) {
        throw new NotFoundError("No admin with the id provided")
    }

    let existingNote = null;

    if (hod.department === "Science") {
        existingNote = await Note.findOne({ _id: noteID, department: "Science" });
    }
    if (hod.department === "Humanities") {
        existingNote = await Note.findOne({ _id: noteID, department: "Humanities" });
    }
    if (hod.department === "Social Science") {
        existingNote = await Note.findOne({ _id: noteID, department: "Social Science" });
    }
    if (hod.department === "Language") {
        existingNote = await Note.findOne({ _id: noteID, department: "Language" });
    }
    if (hod.department === "Mathematics") {
        existingNote = await Note.findOne({ _id: noteID, department: "Mathematics" });
    }
    if (hod.department === "Vocational") {
        existingNote = await Note.findOne({ _id: noteID, department: "Vocational" });
    }


    if (!existingNote) {
        throw new NotFoundError("no note was found with the provide id")
    }

    let deleteUserNote = null
    if (hod.department === "Science") {
        deleteUserNote = await Note.deleteOne({ department: "Science", _id: noteID });
    }
    if (hod.department === "Social Science") {
        deleteUserNote = await Note.deleteOne({ department: "Social Science", _id: noteID });
    }
    if (hod.department === "Humanities") {
        deleteUserNote = await Note.deleteOne({ department: "Humanities", _id: noteID });
    }
    if (hod.department === "Language") {
        deleteUserNote = await Note.deleteOne({ department: "Language", _id: noteID });
    }
    if (hod.department === "Mathematics") {
        deleteUserNote = await Note.deleteOne({ department: "Mathematics", _id: noteID });
    }
    if (hod.department === "Vocational") {
        deleteUserNote = await Note.deleteOne({ department: "Vocational", _id: noteID });
    }


    if (!deleteUserNote) {
        throw new NotFoundError(`No user found with the id ${noteID}`)
    } else {
        const filepath = join(__dirname, "..", "upload", existingNote.file);
        deleteFile(filepath)

        let notedataApproved = null;
        let notedataNotApproved = null;
        let getNote = null;

        if (hod.department === "Science") {
            notedataApproved = await Note.find({ approved: true, department: "Science" })
                .sort({ createdAt: -1 });
            notedataNotApproved = await Note.find({ approved: false, department: "Science" })
                .sort({ createdAt: -1 });
            getNote = await Note.find({ department: "Science" })
                .sort({ createdAt: -1 });
        }
        if (hod.department === "Social Science") {
            notedataApproved = await Note.find({ approved: true, department: "Social Science" })
                .sort({ createdAt: -1 });
            notedataNotApproved = await Note.find({ approved: false, department: "Social Science" })
                .sort({ createdAt: -1 });
            getNote = await Note.find({ department: "Social Science" })
                .sort({ createdAt: -1 });
        }
        if (hod.department === "Humanities") {
            notedataApproved = await Note.find({ approved: true, department: "Humanities" })
                .sort({ createdAt: -1 });
            notedataNotApproved = await Note.find({ approved: false, department: "Humanities" })
                .sort({ createdAt: -1 });
            getNote = await Note.find({ department: "Humanities" })
                .sort({ createdAt: -1 });
        }
        if (hod.department === "Language") {
            notedataApproved = await Note.find({ approved: true, department: "Language" })
                .sort({ createdAt: -1 });
            notedataNotApproved = await Note.find({ approved: false, department: "Language" })
                .sort({ createdAt: -1 });
            getNote = await Note.find({ department: "Language" })
                .sort({ createdAt: -1 });
        }
        if (hod.department === "Mathematics") {
            notedataApproved = await Note.find({ approved: true, department: "Mathematics" })
                .sort({ createdAt: -1 });
            notedataNotApproved = await Note.find({ approved: false, department: "Mathematics" })
                .sort({ createdAt: -1 });
            getNote = await Note.find({ department: "Mathematics" })
                .sort({ createdAt: -1 });
        }

        if (hod.department === "Vocational") {
            notedataApproved = await Note.find({ approved: true, department: "Vocational" })
                .sort({ createdAt: -1 });
            notedataNotApproved = await Note.find({ approved: false, department: "Vocational" })
                .sort({ createdAt: -1 });
            getNote = await Note.find({ department: "Vocational" })
                .sort({ createdAt: -1 });
        }


        res.status(200).json({
            msg: `note with noteID ${noteID} has been deleted successfully...`,
            dataApproved: notedataApproved,
            dataNotApproved: notedataNotApproved,
            note: getNote
        })
    }
}
//HOD ENDS



module.exports = {
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
    getVocationalNoteAdmin
}