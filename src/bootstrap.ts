import dotenv from 'dotenv';
import connectDB from './db/connect.ts';
import * as utils from "./tictactoe/utils/utils.ts";
import setupMiddleware from "./middleware/index.ts";
import setupRouter from "./routes/index.ts";

import type { Express } from 'express';

import setupErrorHandlers from './errors/index.ts';
import HttpError from './errors/HttpError.ts';

dotenv.config();

globalThis.utils = utils;
globalThis.HttpError = HttpError;

/**
 * 
 * @description: Bootstraps the application. Includes:
 * - Setting up middleware
 * - Setting up routes
 * - Setting up error handler
 * - Database connection
 */
export default async function bootstrap(app: Express) {

    console.log("Init Bootstrapping...");

    try{
        setupMiddleware(app);

        setupRouter(app);

        setupErrorHandlers(app);

        await connectDB();

        console.log("Bootstrapping complete.");
    }catch(err){
        console.log("Error when bootstrapping. Error: " + err);
        console.log("Aborting..");
        process.exit(1);
    }    
}
