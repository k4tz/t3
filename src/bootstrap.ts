import dotenv from 'dotenv';
import connectDB from './db/db_connect.ts';
import * as utils from "./tictactoe/utils/utils.ts";
import setupMiddleware from "./middleware/index.ts";
import router from "./routes/index.ts";

import type { Express } from 'express';
import HttpError from './errors/HttpError.ts';

dotenv.config();

globalThis.utils = utils;
globalThis.HttpError = HttpError;

/**
 * 
 * @description: Bootstraps the application. Includes:
 * - Setting up middleware
 * - Setting up routes
 * - Database connection
 */
export default async function bootstrap(app: Express) {

    console.log("Init Bootstrapping...");
    //execute all the bootstrap logic

    try{
        setupMiddleware(app);
        app.use("/", router);
        //connect to db
        await connectDB();

        console.log("Bootstrapping complete.");
    }catch(err){
        console.log("Error when bootstrapping. Error: " + err);
        console.log("Aborting..");
        process.exit(1);
    }    
}
