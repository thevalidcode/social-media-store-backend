import http from "http";
import https from "https";
import { Server } from "socket.io";
import app from "./app";
import { SNICallback } from "./config/ssl";
// import { startCronJobs } from "./cronJobs/index";
import { setupSocket } from "./socket/index";
import { env } from "./config/env";

let mainServer: http.Server | https.Server;

if (env.NODE_ENV === "production") {
  const serverOptions: https.ServerOptions = {
    SNICallback,
  };

  mainServer = https.createServer(serverOptions, app);

  mainServer.listen(6060, () => {
    console.log("HTTPS server running on https://validpanel.com:6060/");
  });

  const secondaryHttpServer = http.createServer(app);
  secondaryHttpServer.listen(4040, () => {
    console.log("HTTP fallback running on http://validpanel.com:4040/");
  });
} else {
  mainServer = http.createServer(app);

  mainServer.listen(6060, () => {
    console.log("Development server running on http://localhost:6060/");
  });
}

// Optional: Enable cron jobs
// startCronJobs();

const io = new Server(mainServer, {
  cors: {
    origin: "*",
  },
  pingTimeout: 5000,
});

setupSocket(io);
