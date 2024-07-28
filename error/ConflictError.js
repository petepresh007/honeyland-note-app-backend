const CustomApiError = require("./CustomApiError");

class ConflictError extends CustomApiError {
    constructor(message) {
        super(message);
        this.statusCode = 409;
    }
}

module.exports = ConflictError;