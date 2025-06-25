"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const ssl_1 = require("./config/ssl");
// import { startCronJobs } from "./cronJobs/index";
const index_1 = require("./socket/index");
const env_1 = require("./config/env");
let mainServer;
if (env_1.env.NODE_ENV === "production") {
    const serverOptions = {
        SNICallback: ssl_1.SNICallback,
    };
    mainServer = https_1.default.createServer(serverOptions, app_1.default);
    mainServer.listen(6060, () => {
        console.log("HTTPS server running on https://validpanel.com:6060/");
    });
    const secondaryHttpServer = http_1.default.createServer(app_1.default);
    secondaryHttpServer.listen(4040, () => {
        console.log("HTTP fallback running on http://validpanel.com:4040/");
    });
}
else {
    mainServer = http_1.default.createServer(app_1.default);
    mainServer.listen(6060, () => {
        console.log("Development server running on http://localhost:6060/");
    });
}
// Optional: Enable cron jobs
// startCronJobs();
const io = new socket_io_1.Server(mainServer, {
    cors: {
        origin: "*",
    },
    pingTimeout: 5000,
});
(0, index_1.setupSocket)(io);
