// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import HttpError from '../errors/HttpError.ts';

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const isHttpError = err instanceof HttpError;
    const statusCode = isHttpError ? err.statusCode : 500;

    // Optional logging hook
    console.error(`[${new Date().toISOString()}]`, {
        path: req.path,
        message: err.message,
        ...(isHttpError && { code: err.code, data: err.data }),
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        message: isHttpError ? err.message : 'Something went wrong',
        ...(isHttpError && err.code && { code: err.code }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export default errorHandler;
