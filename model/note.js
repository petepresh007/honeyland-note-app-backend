const mongoose = require("mongoose");

const noteShema = new mongoose.Schema({
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
            "Social Science",
            "Humanities",
            "Language",
            "Mathematics",
            "Vocational"
        ],
        required: [true, "a department is required"]
    },
    file: {
        type: String,
        required: [true, "please upload a file"]
    },
    subject: {
        type: String,
        enum: [
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
    },
    topic: {
        type: String,
        required: [true, "a topic is needed"]
    },
    studentClass: {
        type: String,
        enum: ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"],
        required: [true, "a class is required"]
    },
    category: {
        type: String,
        enum: ["Science", "Commercial", "Art", "General"],
        required: [true, "a category is required..."]
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

}, { timestamps: true });

module.exports = mongoose.model("Note", noteShema);