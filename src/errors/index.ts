import express from "express";
import responseHandler from "./handlers/ResponseHandler.ts";
import errorLogHandler from "./handlers/ErrorLogHandler.ts";


/**
 * 
 * @param app The express app
 * @description Sets up the error handlers
 * Note: Response error handler always goes at the end of the middleware stack, 
 * logging or other handlers go before.
 */
export default function setupErrorHandlers(app: express.Express) {
    app.use(errorLogHandler);
    app.use(responseHandler);
}