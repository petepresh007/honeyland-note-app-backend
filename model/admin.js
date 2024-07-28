const { model, Schema } = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const noteShema = new Schema({
    username: {
        type: String,
        required: [true, "please, enter a username"],
        min: 3,
        max: 8,
        unique: [true, "a username is required"],
        validate: {
            validator: function (v) {
                return !/\s/.test(v);
            },
            message: props => `${props.value} cannot contain spaces!`
        }
    },
    email: {
        type: String,
        required: [true, "an email address must be provided"],
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
        required: [true, "please, enter a username"],
        min: 3,
        max: 8,
        unique: [true, "a username is required"]
    }
});

/**COMPARE PASSWORD */
noteShema.methods.comparePassword = async function (password) {
    const isPassWordOk = await bcrypt.compare(password, this.password);
    return isPassWordOk;
}

/**JWT_TOKEN*/
noteShema.methods.JWT_TOK = function () {
    return JWT.sign({ username: this.username, userID: this.id }, process.env.JWT_SECRET, {expiresIn:"30d"});
}


module.exports = model("Admin", noteShema);