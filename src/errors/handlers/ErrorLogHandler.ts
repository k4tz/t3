import { Request, Response, NextFunction } from 'express';

/**
 * @description error logs should be handled here. For now simply logging to console, connect 
 * to external logging service in production.
 */
const errorLogHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    
    const isHttpError = err instanceof HttpError;

    console.error(`[${new Date().toISOString()}]`, {
        path: req.path,
        message: err.message,
        ...(isHttpError && { code: err.statusCode, data: err.data }),
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    next(err);
};

export default errorLogHandler;
