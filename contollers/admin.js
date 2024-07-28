const Admin = require("../model/admin");
const { BadrequestError, ConflictError, NotFoundError, UnauthorizedError } = require("../error");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

/**REGISTRATION */
const registration = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            throw new BadrequestError("All fields are required...")
        }

        const user = await Admin.findOne({ email });

        if (user) {
            throw new ConflictError("user already exists...");
        }

        const harshedPassword = await bcrypt.hash(password, 10);

        /**CREATING A NEW USER */
        const newAdim = new Admin({ username, email, password: harshedPassword });
        await newAdim.save();

        const token = newAdim.JWT_TOK();
        /**SENDING A RESPONSE */
        res.status(201).json({ user: { username: newAdim.username, token } });
    } catch (error) {
        res.status(500).json({ msg: `internal server error` });
        console.log(error)
    }
}

/**CREATING A LOGIN */

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadrequestError("Please, enter a username and a password")
    }
    const user = await Admin.findOne({ email });

    if (!user) {
        throw new NotFoundError("Your username or password is not correct");
    }
    const isPasswordOk = await user.comparePassword(password);
    //console.log(isPasswordOk)
    if (!isPasswordOk) {
        throw new ConflictError("Your username or password is not correct");
    }

    /** CREATING A TOKEN*/
    const token = user.JWT_TOK();
    res.cookie("admin_token", token,
        { /**maxAge: 900000,*/ httpOnly: true, sameSite: "none", secure: true })
        .status(200).json({ user: { username: user.username, id: user.id, token } });
}


const stayLoggedIn = (req, res) => {
    try {
        const { admin_token } = req.cookies;
        if (admin_token) {
            JWT.verify(admin_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    //console.log(decode)
                    res.status(200).json(decode);
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new UnauthorizedError("Not authorized")
    }
}

const getSingUserID = async (req, res) => {
    const user = await Admin.findById(req.admin.id).select("-password -confirmpassword -__v");
    if (user) {
        res.status(200).json(user);
    }
}

const logoutAdmin = (req, res) => {
    res.clearCookie('admin_token', { httpOnly: true, sameSite: 'none', secure: true })
        .json(true);
};



/**CHANGE PASSWORD LOADING */
module.exports = { registration, login, stayLoggedIn, logoutAdmin, getSingUserID };