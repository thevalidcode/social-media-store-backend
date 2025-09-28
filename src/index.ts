import http from "http";
import https from "https";
import { Server } from "socket.io";
import app from "./app";
import { updateAllowedHosts } from "./config/cors.config";
import { SNICallback } from "./config/ssl.config";
import { startCronJobs } from "./cronJobs/index";
import { setupSocket } from "./socket/index";
import { env } from "./config/env.config";

let mainServer: http.Server | https.Server;

setInterval(updateAllowedHosts, 5 * 60 * 1000);

async function startServer() {
  await updateAllowedHosts();

  if (env.NODE_ENV === "production") {
    const serverOptions: https.ServerOptions = {
      SNICallback,
    };

    mainServer = https.createServer(serverOptions, app);

    mainServer.listen(env.PRIMARY_PORT, () => {
      console.log(
        `HTTPS server running on https://validpanel.com:${env.PRIMARY_PORT}/`
      );
    });

    const secondaryHttpServer = http.createServer(app);
    secondaryHttpServer.listen(env.SECONDARY_PORT, () => {
      console.log(
        `HTTP fallback running on http://validpanel.com:${env.SECONDARY_PORT}/`
      );
    });
  } else {
    mainServer = http.createServer(app);

    mainServer.listen(env.PRIMARY_PORT, () => {
      console.log(
        `Development server running on http://localhost:${env.PRIMARY_PORT}/`
      );
    });
  }

  startCronJobs();

  const io = new Server(mainServer, {
    cors: {
      origin: "*",
    },
    pingTimeout: 5000,
  });

  setupSocket(io);
}

startServer();
