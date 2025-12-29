import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { updateAllowedHosts } from "./config/cors.config";
import { startCronJobs } from "./cronJobs";
import { setupSocket } from "./socket";
import { env } from "./config/env.config";

const server = http.createServer(app);

setInterval(updateAllowedHosts, 5 * 60 * 1000);

async function startServer() {
  await updateAllowedHosts();

  server.listen(env.PRIMARY_PORT, () => {
    console.log(`Backend running on http://localhost:${env.PRIMARY_PORT}`);
  });

  startCronJobs();

  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
    path: "/socket.io", // keep default unless you change it in Caddy
  });

  setupSocket(io);
}

startServer();
