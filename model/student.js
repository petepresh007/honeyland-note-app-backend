const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const studentSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "firstname is required"]
    },
    lastname: {
        type: String,
        required: [true, "lastname is required"]
    },
    username: {
        type: String,
        required: [true, "username is required"],
        unique: true,
        validate: {
            validator: function (v) {
                return !/\s/.test(v);
            },
            message: props => `${props.value} cannot contain spaces!`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                // This function returns true if v is a valid email address
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: [true, "password is required..."]
    },
    confirmpassword: {
        type: String,
        required: [true, "please confirm the password..."]
    },

    file: String,
    studentClass: {
        type: String,
        enum: ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"],
        required: [true, "a class is required"]
    },
    category: {
        type: String,
        enum: ["Science", "Commercial", "Art", "General"],
        //required: [true, "a category is required..."]
    },
    date: Date,
    approved: {
        type: Boolean,
        required: [true, "approved is req"],
        default: false
    },
    approvedBy: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
})




studentSchema.methods.checkPassword = async function (password) {
    const isPassword = await bcrypt.compare(password, this.password);
    return isPassword;
}

studentSchema.methods.JWT_TOK = function () {
    return JWT.sign({ username: this.username, userID: this.id, file: this.file }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

module.exports = mongoose.model("Student", studentSchema);