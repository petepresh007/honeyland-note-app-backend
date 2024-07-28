const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
    info: {
        type: String,
        required: [true, "an information is needed"]
    },
    //image: String,
    file: String,
}, {timestamps: true})

module.exports = mongoose.model("Info", infoSchema)