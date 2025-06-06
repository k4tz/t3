//core imports
import bootstrap from './bootstrap.js'
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import setupRealtimeEvents from "./tictactoe/core/main.js"

//import and setup middleware
import setupMiddleware from "./middleware/main.js";

//routes imports
import router from "./routes/routes.js";

//import config
import corsConfig from "./config/cors.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: corsConfig.origin } });

setupMiddleware(app);
app.use("/", router);

(async () => {
  await bootstrap();

  setupRealtimeEvents(io);
  
  httpServer.listen(process.env.APP_PORT || 3000, () => {
    console.log(`Listening on port ${process.env.APP_PORT || 3000}`);
  });
})()
