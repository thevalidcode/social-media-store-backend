import { Server } from "socket.io";
/**
 * Sets up WebSocket events and user tracking via Socket.IO
 *
 * @param io - The Socket.IO server instance
 */
declare function setupSocket(io: Server): void;
export { setupSocket };
