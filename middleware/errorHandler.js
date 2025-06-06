function errorHandler(err, req, res, next) {
    const statusCode = err.status || err.statusCode || 500;

    const response = {
    success: false,
    message:
        process.env.NODE_ENV === 'production'
        ? 'Something went wrong.'
        : err.message || 'Unhandled error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
}

export default errorHandler;
  

  