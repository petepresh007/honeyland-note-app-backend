const Admin = require("../model/admin");
const Information = require("../model/info");
const { } = require("../error");


const createInformation = async (req, res) => {
    const { info } = req.body;
    //const admin = await Admin.findById(req.admin.id);

    //const existingInformation = await Information.findOne({ info });

    // if(existingInformation){

    // }
    console.log(req.file)
    res.send(req.file)


}

module.exports = {
    createInformation
}