const User = require("../model/student");
const { NotFoundError, ConflictError, BadrequestError, UnauthorizedError } = require("../error");
const { deleteFile } = require("../middleware/deleteFiles");
const fs = require("fs");
const path = require("path");
const { sendMail } = require("../middleware/sendEmail");
const bcrypt = require("bcrypt");
const Admin = require("../model/admin");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const csvParser = require('csv-parser');
const { fronturl } = require("../frontenturl");


const registerUser = async (req, res) => {
    //"Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"
    const { firstname, lastname, username, email, password, confirmpassword, studentClass, date } = req.body;
    const allowedclass = [
        "Year 7",
        "Year 8",
        "Year 9",
        "Year 10",
        "Year 11",
        "Year 12"
    ]

    if (!firstname || !lastname || !username || !email || !password || !confirmpassword || !allowedclass.includes(studentClass)) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new BadrequestError("All fields are required...");
    }

    // if (!req.file) {
    //     throw new BadrequestError("please, upload a profile picture...")
    // }

    if (password !== confirmpassword) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new ConflictError("make sure you enter the same password for password and confirm password");
    }

    const fileUrl = null
    if (req.fle) {
        fileUrl = req.file.filename;
    }


    const existingUser = await User.findOne({ username })

    if (existingUser) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new ConflictError(`"${existingUser.username}" is already in use by someone else...`);
    }

    const harshedPassword = await bcrypt.hash(password, 10) //10 salt rounds 

    const createdUser = new User({
        firstname,
        lastname,
        username,
        email,
        password: harshedPassword,
        confirmpassword: harshedPassword,
        file: req.file ? fileUrl : "",
        studentClass,
        date: date ? new Date(date) : Date.now()
    });
    //from to subject message
    if (createdUser) {
        await createdUser.save()
        const from = process.env.SMTP_MAIL
        const to = email
        const subject = `Hi ${firstname} ${lastname} Welcome`
        const message = `
            <p>
                Your account has been registered succefully, if approved, you will be contacted<br>
                cheers
            </p>
        `
        await sendMail(from, to, subject, message)
    }

    res.status(201).json({ msg: `Thank you. check ${email} for confirmation` });
}


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadrequestError("please enter email and password to login...");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new BadrequestError("Your email or password is incorrect")
    }

    const isPassword = await user.checkPassword(password);
    if (!isPassword) {
        throw new UnauthorizedError("Your email or password is incorrect");
    }

    if (!user.approved) {
        throw new UnauthorizedError("Your account is not yet approved...")
    }

    const token = user.JWT_TOK();
    res.cookie("student_token", token,
        { /**maxAge: 5000000,*/ httpOnly: true, sameSite: "none", secure: true })
        .status(200).json({ user: { username: user.username, token } });
}

const approveUser = async (req, res) => {
    const { userID } = req.params;
    const admin = await Admin.findById(req.admin.id);
    const user = await User.findById(userID);
    if (!user) {
        throw new NotFoundError("user has been deleted or user does not exists");
    }

    if (admin) {
        if (user.approved === true) {
            throw new ConflictError("user has already been approved");
        } else {
            user.approved = true;
            user.approvedBy = req.admin.username;
            await user.save();

            const from = process.env.SMTP_MAIL
            const to = user.email
            const subject = `<h1>Hi ${user.firstname}</h1>`
            const message = `
            <p>
                Your account has been Approved
            </p>
        `
            await sendMail(from, to, subject, message)
            const userdataApproved = await User.find({ approved: true })
                .select("-__v -password -confirmpassword");
            const userdataNotApproved = await User.find({ approved: false })
                .select("-__v -password -confirmpassword");
            const data = await User.find({})
                .select("-__v -password -confirmpassword")
                .sort({ date: -1 })
            res.status(200).json({
                msg: true, dataApproved: userdataApproved,
                dataNotApproved: userdataNotApproved,
                data: data
            });
        }
    }
}

const blockUser = async (req, res) => {
    const { userID } = req.params;
    const admin = await Admin.findById(req.admin.id);
    const user = await User.findById(userID);
    if (!user) {
        throw new NotFoundError("user has been deleted or user does not exists")
    }

    if (admin) {
        if (user.approved === false) {
            throw new ConflictError("user has been blocked already");
        } else {
            user.approved = false;
            user.approvedBy = req.admin.username;
            await user.save();
            const userdataApproved = await User.find({ approved: true })
                .select("-__v -password -confirmpassword");
            const userdataNotApproved = await User.find({ approved: false })
                .select("-__v -password -confirmpassword");
            const data = await User.find({})
                .select("-__v -password -confirmpassword")
                .sort({ date: -1 })
            res.status(200).json({
                msg: true,
                dataApproved: userdataApproved,
                dataNotApproved: userdataNotApproved,
                data: data
            });
        }
    }
}


const stayLoggedIn = (req, res) => {
    try {
        const { student_token } = req.cookies;
        if (student_token) {
            JWT.verify(student_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    res.status(200).json(decode)
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new UnauthorizedError("Not authorized")
    }
}

const getSingleUser = async (req, res) => {
    const { userID } = req.params;
    const user = await User.findById(userID).select("-password -confirmpassword -__v");
    if (user) {
        res.status(200).json(user);
    }
}

/**DO IT THE EASY WAY PROVIDED MAN IS LOGGED IN */
const getSingUserID = async (req, res) => {
    const user = await User.findById(req.student.id).select("-password -confirmpassword -__v");
    if (user) {
        res.status(200).json(user);
    }
}


const logoutUser = (req, res) => {
    res.clearCookie('student_token', { httpOnly: true, sameSite: 'none', secure: true })
        .json(true);
};


//update profile pics
const updateProfilePics = async (req, res) => {
    if (!req.file) {
        throw new BadrequestError("please select an image...")
    }
    const profilePics = req.file.filename;
    const user = await User.findById(req.student.id);

    if (user) {
        const filePath = path.join(__dirname, "..", "upload", user.file);
        if (user.file !== '' || user.file !== undefined) {
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        const updateProfilePics = await User.findByIdAndUpdate(req.student.id, {
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            password: user.password,
            confirmpassword: user.confirmpassword,
            file: profilePics,
            date: user.date,
            approved: user.approved,
            approvedBy: user.approvedBy
        }, { new: true }).select("-__v -password -confirmpassword");
        if (updateProfilePics) {
            res.status(200).json({ msg: "profile picture uploaded suucessfully...", data: updateProfilePics })
        }
    }

}

//update username and password
const updateUsernamePassword = async (req, res) => {
    const user = await User.findById(req.student.id);
    if (!user) {
        throw new NotFoundError("No user was not found...")
    }

    const { password, newpassword, confirmpassword } = req.body;
    if (!password || !newpassword || !confirmpassword) {
        throw new BadrequestError("enter a password to update")
    }
    const isPasswordOk = await bcrypt.compare(password, user.password)
    if (!isPasswordOk) {
        throw new BadrequestError("Bro, enter a valid password existing password")
    }

    if (newpassword !== confirmpassword) {
        throw new BadrequestError("Make sure your new pasword and confirm password fields are the same")
    }

    const newPass = await bcrypt.hash(newpassword, 10) //10 salt rounds


    if (user) {
        const updatePassword = await User.findByIdAndUpdate(req.student.id, {
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            password: newPass,
            confirmpassword: newPass,
            file: user.file,
            date: user.date,
            approved: user.approved,
            approvedBy: user.approvedBy
        }, { new: true });

        if (updatePassword) {
            res.status(200).json({ msg: `password updated successfully...` });
        }
    }

}

/**NOT ACTIVATED USER */
const getNotActivatedUsers = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("Throw new bad request error...")
    }
    if (admin) {
        const notActivatedUSer = await User.find({ approved: false }).select("-__v -password -confirmpassword");
        if (notActivatedUSer) {
            res.status(200).json(notActivatedUSer)
        }
    }
}

/**ACTIVATED USERS */
const getActivatedUsers = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("Throw new bad request error...")
    }
    if (admin) {
        const ActivatedUSer = await User.find({ approved: true }).select("-__v -password -confirmpassword");
        if (ActivatedUSer) {
            res.status(200).json(ActivatedUSer)
        }
    }
}

/**get all users */
const getAllUsers = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("No admin was found...")
    }
    if (admin) {
        const allUSer = await User.find({})
            .select("-__v -password -confirmpassword")
            .sort({ date: -1 })
        if (allUSer) {
            res.status(200).json(allUSer)
        }
    }
}

const deleteSingleUser = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    const { userID } = req.params;
    const user = await User.findById(userID);
    if (!user) {
        throw new NotFoundError("no user was found...");
    }
    if (!admin) {
        throw new NotFoundError("No admin was found...");
    }


    if (admin) {
        const deleteUser = await User.findByIdAndRemove(userID, { new: true })
        if (deleteUser) {
            const filePath = path.join(__dirname, "..", "upload", user.file);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath)
            }
            const data = await User.find({}).select("-__v -password -confirmpassword");
            const userdataApproved = await User.find({ approved: true }).select("-__v -password -confirmpassword");
            const userdataNotApproved = await User.find({ approved: false }).select("-__v -password -confirmpassword");
            res.status(200).json({ msg: "deleted successfully...", data: data, dataApproved: userdataApproved, dataNotApproved: userdataNotApproved })
        }
    }
}


const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
        throw new BadrequestError("Please provide a vaid email address");
    }
    const token = crypto.randomBytes(20).toString("hex");
    userData.resetPasswordToken = token;
    userData.resetPasswordExpires = Date.now() + 3600000;
    await userData.save();

    console.log(userData.resetPasswordToken)

    //send mail
    //sent_from, send_to, subject, message
    const sent_from = process.env.SMTP_MAIL
    const send_to = email;
    const subject = "reset password";
    const message = `
        You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
           ${fronturl}/reset-password/${token}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n
        `
    await sendMail(sent_from, send_to, subject, message);
    res.status(200).json({ msg: `check the email: ${email} to reset your password` });
}

const changeForgottenPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmpassword } = req.body;

    if (!password || !confirmpassword) {
        throw new BadrequestError("please complete the available fields to update your password")
    }
    const userData = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    })

    if (!userData) {
        throw new BadrequestError("Your token has expired")
    }

    if (password !== confirmpassword) {
        throw new BadrequestError("make sure the passwords are the same.")
    }

    userData.password = await bcrypt.hash(password, 10) //ten salt round
    userData.resetPasswordToken = '';
    userData.resetPasswordExpires = '';
    await userData.save();

    res.status(200).json({ msg: `password changed successfully...` })
}


async function search(req, res) {
    const admin = await Admin.findById(req.admin.id);


    const firstname = req.query.firstname;
    const regex = new RegExp(firstname, "i");
    if (admin) {
        try {
            const students = await User.find({ firstname: { $regex: regex }, approved: true })
                .sort({ date: -1 })
            res.json(students);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};


const adminAegisterUser = async (req, res) => {
    //"Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"
    const admin = await Admin.findById(req.admin.id)
    const {
        firstname,
        lastname,
        username,
        email,
        /*password, confirmpassword,**/
        studentClass,
        date,
        category
    } = req.body;


    const allowedclass = [
        "Year 7",
        "Year 8",
        "Year 9",
        "Year 10",
        "Year 11",
        "Year 12"
    ]

    const acceptedCategory = [
        "Science",
        "Commercial",
        "Art", "General"
    ]

    if (!firstname || !lastname || !username || !email || /**!password || !confirmpassword ||*/ !allowedclass.includes(studentClass) || !acceptedCategory.includes(category)) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new BadrequestError("All fields are required...");
    }

    // if (!req.file) {
    //     throw new BadrequestError("please, upload a profile picture...")
    // }

    // if (password !== confirmpassword) {
    //     if (req.file) {
    //         const filePath = path.join(__dirname, "..", "upload", req.file.filename);
    //         if (fs.existsSync(filePath)) {
    //             deleteFile(filePath);
    //         }
    //     }
    //     throw new ConflictError("make sure you enter the same password for password and confirm password");
    // }

    const fileUrl = null
    if (req.fle) {
        fileUrl = req.file.filename;
    }


    const existingUser = await User.findOne({ username })

    if (existingUser) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new ConflictError(`"${existingUser.username}" is already in use by someone else...`);
    }

    //const harshedPassword = await bcrypt.hash(password, 10) //10 salt rounds
    const data = `${Math.floor(Math.random() * 1000)}`;

    function createRandomString(length) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    const randompass = data + createRandomString(5);
    console.log(randompass)
    const harshedRand = await bcrypt.hash(randompass, 10);

    if (admin) {
        const createdUser = new User({
            firstname,
            lastname,
            username,
            email,
            password: harshedRand,
            confirmpassword: harshedRand,
            file: req.file ? fileUrl : "",
            studentClass,
            category,
            date: date ? new Date(date) : Date.now(),
            approved: true
        });
        //from to subject message
        if (createdUser) {
            await createdUser.save()
            const from = process.env.SMTP_MAIL
            const to = email
            const subject = `Hi ${firstname} ${lastname} Welcome`
            const message = `
            <p>
                Your account has been registered succefully with the following credentials<br>
                email: ${email}<br>
                password: ${randompass}
            </p>
        `
            await sendMail(from, to, subject, message)
        }

        res.status(201).json({ msg: `registered successfully...` });
    }
}


const allowedclass = [
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12"
];

const acceptedCategory = [
    "Science",
    "Commercial",
    "Art",
    "General"
];

const adminRegisterUserViaUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        return res.status(403).send('Unauthorized.');
    }

    const users = [];

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (row) => {
            users.push(row);
        })
        .on('end', async () => {
            const errors = [];
            const createdUsers = [];

            for (const userData of users) {
                const {
                    firstname,
                    lastname,
                    username,
                    email,
                    studentClass,
                    date,
                    category
                } = userData;

                if (
                    !firstname || !lastname || !username || !email || !allowedclass.includes(studentClass) || !acceptedCategory.includes(category)
                ) {
                    errors.push({
                        userData,
                        error: "All fields are required, make sure you are supplying a valid value for studentClass and category"
                    });
                    continue;
                }

                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    errors.push({
                        userData,
                        error: `a user with the email: ${existingUser.email} already exists`
                    });
                    continue;
                }

                // Random password generation
                const data = `${Math.floor(Math.random() * 1000)}`;

                function createRandomString(length) {
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    let result = "";
                    for (let i = 0; i < length; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return result;
                }

                const randompass = data + createRandomString(5);
                console.log(randompass)
                const hashedRand = await bcrypt.hash(randompass, 10);

                const newUser = new User({
                    firstname,
                    lastname,
                    username,
                    email,
                    password: hashedRand,
                    confirmpassword: hashedRand,
                    studentClass,
                    file: "",
                    category,
                    date: date ? new Date(date) : Date.now(),
                    approved: true
                });

                if (newUser) {
                    const from = process.env.SMTP_MAIL
                    const to = [email]
                    const subject = `Hi ${firstname} ${lastname} Welcome`
                    const message = `
                <p>
                    Your account has been registered succefully with the following details<br>
                    ${email}<br>
                    ${randompass}
                </p>
                `
                    await sendMail(from, to, subject, message)
                }

                try {
                    await newUser.save();
                    createdUsers.push(newUser);
                } catch (saveError) {
                    errors.push({
                        userData,
                        error: saveError.message
                    });
                }
            }

            fs.unlinkSync(req.file.path); // Clean up uploaded file

            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Some users could not be processed.',
                    errors,
                    createdUsers
                });
            } else {
                return res.status(201).json({
                    message: 'All users processed successfully.',
                    createdUsers
                });
            }
        });
};


const assignCategory = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    const { category } = req.body;
    const { userID } = req.params;
    const user = await User.findById(userID);

    if (!admin) {
        throw new BadrequestError("no admin was find with the provided id")
    }
    if (!user) {
        throw new NotFoundError("no note was found with the provided id...")
    }
    if (admin) {
        if (user.category === category) {
            throw new ConflictError(`the note is already assigned the category: ${category}`)
        } else {
            user.category = category;
            await note.save()
            const data = await User.find({})
                .sort({ date: -1 })
                .select("-password -confirmpassword -__v")
            res.status(200).json({ msg: `user has been assigned category: ${category}`, data: data })
        }

    }


}

module.exports = {
    registerUser,
    loginUser,
    approveUser,
    blockUser,
    stayLoggedIn,
    getSingleUser,
    logoutUser,
    updateProfilePics,
    getSingUserID,
    updateUsernamePassword,
    getNotActivatedUsers,
    getActivatedUsers,
    getAllUsers,
    deleteSingleUser,
    forgetPassword,
    changeForgottenPassword,
    search,
    adminAegisterUser,
    adminRegisterUserViaUpload,
    assignCategory
}