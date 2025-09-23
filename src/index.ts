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
const io = new Server(httpServer, { 
    cors: { 
        origin: corsConfig().origin,
        methods: corsConfig().methods,
        credentials: corsConfig().credentials
    } 
});



bootstrap(app)
.then(async () => {
  const realtimeCleanup = await setupRealtimeEvents(io); 
  
  const server = httpServer.listen(appConfig.port, () => {
    console.log(`Listening on port ${appConfig.port}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    // Cleanup matchmaking service
    if (realtimeCleanup && realtimeCleanup.cleanup) {
      realtimeCleanup.cleanup();
    }
    
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
})
.catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});
