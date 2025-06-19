import "dotenv/config";
import http from "http";
import https from "https";
import app from "./app.js";
import { SNICallback } from "./config/ssl.js";
import { startCronJobs } from "./cronJobs/index.js";
import { setupSocket } from "./socket/index.js";
import { Server } from "socket.io";

const env = process.env.NODE_ENV;

let mainServer;

// Main server setup
if (env === "production") {
  const serverOptions = { SNICallback };
  mainServer = https.createServer(serverOptions, app);
  mainServer.listen(6060, () => {
    console.log("HTTPS server running on https://validpanel.com:6060/");
  });

  // Secondary HTTP server (optional, based on your use case)
  const secondaryHttpServer = http.createServer(app);
  secondaryHttpServer.listen(4040, () => {
    console.log("HTTP server running on http://validpanel.com:4040/");
  });
} else {
  mainServer = http.createServer(app);
  mainServer.listen(6060, () => {
    console.log("Development server running on http://localhost:6060/");
  });
}

// Cron jobs
// startCronJobs();

// Socket setup
const io = new Server(mainServer, {
  cors: {
    origin: "*",
  },
  pingTimeout: 5000,
});

setupSocket(io);
