const notFound = (req, res, next) => {

    const error = new Error(
        `Route not found: ${req.originalUrl}`
    );

    res.status(404);

    next(error);
};

const errorHandler = (
    error,
    req,
    res,
    next
) => {

    const statusCode =
        res.statusCode === 200
            ? 500
            : res.statusCode;

    console.error(
        error.stack
    );

    res.status(statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack
        })
    });
};

module.exports = {
    notFound,
    errorHandler
};