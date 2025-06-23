"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const crud_1 = require("../crud");
/**
 * Sets up WebSocket events and user tracking via Socket.IO
 *
 * @param io - The Socket.IO server instance
 */
function setupSocket(io) {
    io.on("connection", (socket) => {
        // Handle initial connection from client
        socket.on("initConnection", async (data) => {
            socket.userData = data;
            try {
                await (0, crud_1.updatePanelDoc)("users", data.uid, { status: "online", last_seen: new Date() }, data.panel_id);
            }
            catch (err) {
                console.error("Error updating user status on initConnection:", err);
            }
        });
        // Broadcast new support ticket message to all clients
        socket.on("newTicketMessage", (msg) => {
            io.emit("newTicketMessage", msg);
        });
        // Broadcast typing notification
        socket.on("userTyping", (msg) => {
            io.emit("userTyping", msg);
        });
        // Handle user disconnection
        socket.on("disconnect", async () => {
            if (socket.userData) {
                const { uid, panel_id } = socket.userData;
                try {
                    await (0, crud_1.updatePanelDoc)("users", uid, { status: "offline", last_seen: new Date() }, panel_id);
                }
                catch (err) {
                    console.error("Error updating user status on disconnect:", err);
                }
            }
        });
    });
}
