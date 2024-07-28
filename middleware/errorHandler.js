const errorHandler = (err, req, res, next) => {
    // if(err instanceof CustomApiError){
    //     return res.status(err.statuscodes).json({ msg: err.message })
    // }

    //customError object
    const CustomError = {
        statuscodes: err.statusCode || 500,
        msg: err.message || "internal server error occured"
    }

    //validation error
    if (err.name === "ValidatorError") {
        CustomError.msg = Object.values(err.errors).map((item) => {
            item.message.join(",");
        })
        CustomError.statuscodes = 400;
    }

    //duplicate error
    if (err.code && err.code === 11000) {
        CustomError.msg = ` ${Object.keys(err.keyValue)} already exist, please enter another ${Object.keys(err.keyValue)}`;
        CustomError.statuscodes = 400;
    }

    //cast error
    if (err.name === "CastError") {
        CustomError.msg = `No item found with id: ${err.value}`;
        CustomError.statuscodes = 404;
    }
    res.status(CustomError.statuscodes).json({ msg: CustomError.msg });
}

module.exports = errorHandler;