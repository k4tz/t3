//core imports
import bootstrap from './bootstrap.ts'
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import setupRealtimeEvents from "./tictactoe/core/index.js"

//import config
import corsConfig from "./config/cors.ts";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: corsConfig.origin } });



bootstrap(app)
.then(() => {
  setupRealtimeEvents(io); 
  
  httpServer.listen(process.env.APP_PORT || 3000, () => {
    console.log(`Listening on port ${process.env.APP_PORT || 3000}`);
  });
})
.catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});
