import { Request, Response, NextFunction } from 'express';
import HttpError from '../HttpError.ts';

const responseHandler = (
    err: Error | HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (res.headersSent) {
        return next(err)
    }

    const isHttpError = err instanceof HttpError;
    
    // Handle MongoDB duplicate key errors
    if ('code' in err && err.code === 'E11000') {
        const statusCode = 409; // Conflict
        res.status(statusCode).json({
            success: false,
            message: 'User already exists',
            code: statusCode,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        });

        return;
    }
    
    // Handle other MongoDB errors
    if (err.name === 'ValidationError') {
        const statusCode = 400; // Bad Request
        res.status(statusCode).json({
            success: false,
            message: 'Validation error',
            code: statusCode,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        });

        return;
    }
    
    // Handle HttpError instances
    const statusCode = isHttpError ? err.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: isHttpError ? err.message : 'Something went wrong',
        ...(isHttpError && err.statusCode && { code: err.statusCode }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export default responseHandler;
