import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import corsConfig from "../config/cors.ts";
import generateCsrfToken from "./generateCSRFToken.ts";
import verifyCsrfToken from "./verifyCSRFToken.ts";
import errorHandler from "./errorHandler.ts";

export default function setupMiddleware(app: express.Express) {
    app.use(cors(corsConfig));
    app.use(cookieParser());
    app.use(express.json());
    app.use(generateCsrfToken);
    app.use(verifyCsrfToken);
    app.use(errorHandler);
}