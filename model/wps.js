const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
    author: {
        type: String,
        required: [true, "provide a username"],
        min: 5,
        max: 12
    },
    description: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        enum: [
            "Science",
            "Art",
            "Humanities",
            "Language"
        ],
        required: [true, "a department is required"]
    },
    text: {
        type: String,
        required: [true, "enter a text..."],
        unique: true
    },
    filename:String,
    subject: {
        type: String,
        enum: [
            "Computer Science",
            "Mathematics",
            "English Language",
            "Physics",
            "Chemistry",
            "Others"
        ]
    },
    topic: {
        type: String,
        required: [true, "a topic is needed"]
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "Admin"
    },
    approved: {
        type: Boolean,
        required: [true, "approved is req"],
        default: false
    },
    approvedBy: String
},{timestamps: true})

module.exports = mongoose.model("wps", textSchema)