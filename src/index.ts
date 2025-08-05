//core imports
import bootstrap from "./bootstrap.ts"
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import setupRealtimeEvents from "./tictactoe/core/index.ts"

//import config
import appConfig from "./config/app.ts";
import corsConfig from "./config/cors.ts";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: corsConfig.origin } });



bootstrap(app)
.then(() => {
  setupRealtimeEvents(io); 
  
  httpServer.listen(appConfig.port, () => {
    console.log(`Listening on port ${appConfig.port}`);
  });
})
.catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});
