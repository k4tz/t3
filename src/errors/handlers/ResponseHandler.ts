import { Request, Response, NextFunction } from 'express';

const responseHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (res.headersSent) {
        return next(err)
    }

    const isHttpError = err instanceof HttpError;
    const statusCode = isHttpError ? err.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: isHttpError ? err.message : 'Something went wrong',
        ...(isHttpError && err.statusCode && { code: err.statusCode }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export default responseHandler;
