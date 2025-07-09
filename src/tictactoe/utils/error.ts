const throwErrWithStatusCode = (msg: string, statusCode: number) => {
    const err = new Error(msg);
    err.statusCode = statusCode;
    throw err;
}

export { throwErrWithStatusCode };