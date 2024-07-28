const CustomApiError = require("./CustomApiError");

class NotFoundError extends CustomApiError{
    constructor(message){
        super(message);
        this.statusCode = 404;
    }
}

module.exports = NotFoundError;