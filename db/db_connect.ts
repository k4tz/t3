// Import the mongoose module
import mongoose from "mongoose";
import User from "./models/User.ts";

export default async function connectDB() {
    // Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
    // Included because it removes preparatory warnings for Mongoose 7.
    // See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
    mongoose.set("strictQuery", false);

    // Define the database URL to connect to.
    const dbURI = process.env.DATABASE_CONN_URL;

    if(!dbURI) {
        throw new Error("Database connection string not found");
    }

    //attempt to connect to database
    try{
        await mongoose.connect(dbURI);
        
        console.log("Connected to MongoDB");
    }catch(err){
        console.log("Failed to connect to MongoDB. Error: " + err);
        throw err;
    }
}
