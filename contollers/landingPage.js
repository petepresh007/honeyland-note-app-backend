const Landing = require("../model/landingPage");
const Admin = require("../model/admin");
const { ConflictError, NotFoundError } = require("../error")


const createLandingPage = async (req, res) => {
    const { topic, subtopic } = req.body;
    const admin = await Admin.findById(req.admin.id);
    const existingLanding = await Landing.findOne({ topic, subtopic })

    if (existingLanding) {
        throw new ConflictError("information already exists...");
    }

    if (!admin) {
        throw new NotFoundError(`No admin was found with the provided id...`)
    }

    if (admin) {
        const createdLanding = new Landing({
            topic, subtopic
        })

        if (createdLanding) {
            await createdLanding.save()
            res.status(201).json({ msg: `landing created successfully...` })
        }
    }
}


const getAllLanding = async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined
    const allLanding = await Landing.find({}).limit(limit).sort({ createdAt: -1 });
    if (allLanding) {
        res.status(200).json(allLanding)
    }
}


module.exports = {
    createLandingPage,
    getAllLanding
}