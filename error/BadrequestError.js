const CustomApiError = require("./CustomApiError");

class BadrequestError extends CustomApiError {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}

module.exports = BadrequestError;