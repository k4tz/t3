import { Request, Response, NextFunction } from 'express';

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
