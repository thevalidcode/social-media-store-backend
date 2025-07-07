import { Server, Socket } from "socket.io";
import { updateStoreDoc } from "../crud";

// Define the structure of user data expected from the client
interface SocketUserData {
  uid: string;
  store_id: number;
}

// Extend the default Socket type to include userData
interface CustomSocket extends Socket {
  userData?: SocketUserData;
}

/**
 * Sets up WebSocket events and user tracking via Socket.IO
 *
 * @param io - The Socket.IO server instance
 */
function setupSocket(io: Server): void {
  io.on("connection", (socket: CustomSocket) => {
    // Handle initial connection from client
    socket.on("initConnection", async (data: SocketUserData) => {
      socket.userData = data;

      try {
        await updateStoreDoc(
          "users",
          data.uid,
          { status: "online", last_seen: new Date() },
          data.store_id
        );
      } catch (err) {
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
        const { uid, store_id } = socket.userData;

        try {
          await updateStoreDoc(
            "users",
            uid,
            { status: "offline", last_seen: new Date() },
            store_id
          );
        } catch (err) {
          console.error("Error updating user status on disconnect:", err);
        }
      }
    });
  });
}

export { setupSocket };
