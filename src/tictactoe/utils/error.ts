import HttpError from '../../errors/HttpError.ts';

const throwErrWithStatusCode = (msg: string, statusCode: number) => {
    throw new HttpError(msg, statusCode);
}

export { throwErrWithStatusCode };