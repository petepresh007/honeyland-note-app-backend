const mongoose = require("mongoose");

const landingSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, "a topic is needed"]
    },
    subtopic: {
        type: String,
        required: [true, "a topic is needed"]
    }
}, {timestamps: true})

module.exports = mongoose.model("LandingPage", landingSchema)