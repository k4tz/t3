import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import corsConfig from "../config/cors.js";
import generateCsrfToken from "./generateCSRFToken.js";
import verifyCsrfToken from "./verifyCSRFToken.js";

export default function setupMiddleware(app) {
    app.use(cors(corsConfig));
    app.use(cookieParser());
    app.use(express.json());
    app.use(generateCsrfToken);
    app.use(verifyCsrfToken);
}