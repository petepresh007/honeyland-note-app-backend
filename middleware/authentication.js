const { UnauthorizedError } = require("../error");
const JWT = require("jsonwebtoken");


const authentication = (req, res, next) => {
    const authHeaders = req.headers.authorization;

    /**CHECKING FOR authrntication*/
    if (!authHeaders || !authHeaders.startsWith("Bearer")) {
        throw new UnauthorizedError("provide a valid token");
        //console.log("error occured");
    }

    const token = authHeaders.split(" ")[1];

    try {
        const decodedData = JWT.verify(token, process.env.JWT_SECRET);
        req.user = { username: decodedData.username, userID: decodedData.userID };
        next();
    } catch (error) {
        throw new UnauthorizedError("The token is not valid");
    }
}

module.exports = authentication;