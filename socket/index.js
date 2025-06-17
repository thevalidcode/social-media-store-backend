const { updatePanelDoc } = require("../crud");

function setupSocket(io) {
  io.on("connection", (socket) => {
    socket.on("initConnection", async (data) => {
      socket.userData = data;
      try {
        await updatePanelDoc(
          "users",
          socket.userData.uid,
          { status: "online", last_seen: new Date() },
          socket.userData.panel_id
        );
      } catch (err) {
        console.error("Error updating user status on initConnection:", err);
      }
    });

    socket.on("newTicketMessage", (msg) => {
      io.emit("newTicketMessage", msg);
    });

    socket.on("userTyping", (msg) => {
      io.emit("userTyping", msg);
    });

    socket.on("disconnect", async () => {
      if (socket.userData) {
        try {
          await updatePanelDoc(
            "users",
            socket.userData.uid,
            { status: "offline", last_seen: new Date() },
            socket.userData.panel_id
          );
        } catch (err) {
          console.error("Error updating user status on disconnect:", err);
        }
      }
    });
  });
}

module.exports = { setupSocket };
