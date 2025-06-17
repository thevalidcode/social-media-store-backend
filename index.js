require("dotenv").config();
const http = require("http");
const https = require("https");
const app = require("./app");
const { SNICallback } = require("./config/ssl");
const { startCronJobs } = require("./cronJobs");
const { setupSocket } = require("./socket");
const { Server } = require("socket.io");

const env = process.env.NODE_ENV;

let mainServer;

// Main server setup
if (env === "production") {
  const serverOptions = { SNICallback };
  mainServer = https.createServer(serverOptions, app);
  mainServer.listen(4001, () => {
    console.log("HTTPS server running on https://validpanel.com:4001/");
  });

  // Secondary HTTP server (optional, based on your use case)
  const secondaryHttpServer = http.createServer(app);
  secondaryHttpServer.listen(3001, () => {
    console.log("HTTP server running on http://validpanel.com:3001/");
  });
} else {
  mainServer = http.createServer(app);
  mainServer.listen(4001, () => {
    console.log("Development server running on http://localhost:4001/");
  });
}

// Cron jobs
startCronJobs();

// Socket setup
const io = new Server(mainServer, {
  cors: {
    origin: "*",
  },
  pingTimeout: 5000,
});

setupSocket(io);
