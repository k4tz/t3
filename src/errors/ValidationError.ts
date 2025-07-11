export default class ValidationError extends Error {
    statusCode: number;
    code?: string;
    data?: any;

    constructor(message: string, statusCode: number = 500, options?: { code?: string; data?: any }) {
        super(message);
        this.statusCode = statusCode;
        this.code = options?.code;
        this.data = options?.data;

        Error.captureStackTrace(this, this.constructor);
    }
}

export type ValidationErrorype = typeof ValidationError;
