import {Request, Response, NextFunction} from 'express';

function errorHandler(err: globalThis.Error, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.statusCode || 500;

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