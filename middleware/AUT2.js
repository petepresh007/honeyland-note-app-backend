const JWT = require("jsonwebtoken");
const { UnauthorizedError } = require("../error");


module.exports.AUTHTWO = (req, res, next) => {
    try {
        const { admin_token } = req.cookies;
        if (admin_token) {
            JWT.verify(admin_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    req.admin = { username: decode.username, id: decode.userID }
                    next()
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new UnauthorizedError("Not authorized")
    }
}


module.exports.AUTHTWOUSER = (req, res, next) => {
    try {
        const { user_token } = req.cookies;
        if (user_token) {
            JWT.verify(user_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    req.user = { username: decode.username, id: decode.userID, file: decode.file }
                    next()
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new UnauthorizedError("Not authorized")
    }
}

module.exports.AUTHTWOSTUDENT = (req, res, next) => {
    try {
        const { student_token } = req.cookies;
        if (student_token) {
            JWT.verify(student_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    req.student = { username: decode.username, id: decode.userID, file: decode.file }
                   // console.log(decode)
                    next()
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new UnauthorizedError("Not authorized")
    }
}


module.exports.AUTHTWOHOD = (req, res, next) => {
    try {
        const { hod_token } = req.cookies;
        if (hod_token) {
            JWT.verify(hod_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    req.hod = { username: decode.username, id: decode.userID, file: decode.file }
                    next()
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new UnauthorizedError("Not authorized")
    }
}