const {
  getDocs,
  deletePanelDoc,
  updatePanelDoc,
  addPanelDoc,
} = require("../crud");
const { sendEmail } = require("../utils/emails");
const { checkKey } = require("../utils/checkapikey");

exports.createTicket = async (req, res) => {
  const { key, panel_id, data } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allUsers = await getDocs("users", panel_id);
  const userExists = allUsers.some((user) => user.api_key === key);

  if (!userExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    await addPanelDoc(
      "supports",
      { ...data, is_read_by_user: true, is_read_by_admin: false },
      panel_id
    );

    const userArr = await getDocs("users", panel_id, {
      find: { field: "uid", operator: "===", value: data.user_id },
    });
    const user = Array.isArray(userArr) ? userArr[0] : userArr;

    await sendEmail(
      undefined,
      "new_support",
      { ...data, user: user?.username || "" },
      panel_id
    );

    res.status(200).json({ success: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  const { key, panel_id } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    let tickets = await getDocs("supports", panel_id, {
      sort: { property: "id", order: "desc" },
    });

    const ticketsWithUser = [];
    for (const ticket of tickets) {
      const userArr = await getDocs("users", panel_id, {
        find: { field: "uid", operator: "===", value: ticket.user_id },
      });
      const user = Array.isArray(userArr) ? userArr[0] : userArr;
      ticketsWithUser.push({ ...ticket, username: user?.username || "" });
    }

    ticketsWithUser.sort((a, b) => {
      if (a.is_read_by_admin === b.is_read_by_admin) {
        return b.id - a.id;
      }
      return a.is_read_by_admin ? 1 : -1;
    });

    res.status(200).json(ticketsWithUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnreadTicketsLength = async (req, res) => {
  const { key, panel_id } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const response = checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    let tickets = await getDocs("supports", panel_id, {
      filter: {
        field: response.userData ? "is_read_by_user" : "is_read_by_admin",
        operator: "===",
        value: false,
      },
    });

    if (response.userData) {
      tickets = tickets.filter(
        (ticket) => ticket.user_id === response.userData.uid
      );
    }

    res.status(200).json({ length: tickets.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.userGetTickets = async (req, res) => {
  const { key, panel_id, uid } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allUsers = await getDocs("users", panel_id);
  const userExists = allUsers.some((user) => user.api_key === key);

  if (!userExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    let tickets = await getDocs("supports", panel_id, {
      filter: { field: "user_id", operator: "===", value: uid },
      sort: { property: "id", order: "desc" },
    });

    tickets.sort((a, b) => {
      if (a.is_read_by_user === b.is_read_by_user) {
        return b.id - a.id;
      }
      return a.is_read_by_user ? 1 : -1;
    });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTicketDetails = async (req, res) => {
  const { key, panel_id, ticket_id } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const ticketArr = await getDocs("supports", panel_id, {
      find: { field: "id", operator: "===", value: parseInt(ticket_id) },
      removeKeys: ["user_id"],
    });
    const ticket = Array.isArray(ticketArr) ? ticketArr[0] : ticketArr;

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { key, panel_id, ticket_id } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const messages = await getDocs("supports_messages", panel_id, {
      filter: {
        field: "ticket_id",
        operator: "===",
        value: parseInt(ticket_id),
      },
      sort: { property: "timestamp", order: "asc" },
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.userGetMessages = async (req, res) => {
  const { key, panel_id, ticket_id } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allUsers = await getDocs("users", panel_id);
  const userExists = allUsers.some((user) => user.api_key === key);

  if (!userExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const messages = await getDocs("supports_messages", panel_id, {
      filter: {
        field: "ticket_id",
        operator: "===",
        value: parseInt(ticket_id),
      },
      sort: { property: "timestamp", order: "asc" },
    });

    const ticketDetailsArr = await getDocs("supports", panel_id, {
      find: { field: "id", operator: "===", value: parseInt(ticket_id) },
      removeKeys: ["is_read_by_admin"],
    });
    const ticketDetails = Array.isArray(ticketDetailsArr)
      ? ticketDetailsArr[0]
      : ticketDetailsArr;

    res.status(200).json({ messages, ticketDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { key, panel_id, ticket_id, message, sender, uid } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const messageData = {
      content: message,
      sender: sender,
      timestamp: new Date(),
      ticket_id: parseInt(ticket_id),
    };

    await addPanelDoc("supports_messages", messageData, panel_id);
    await updatePanelDoc(
      "supports",
      uid,
      { is_read_by_user: false, status: "Answered" },
      panel_id
    );

    res.status(200).json({ success: "Sent Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.userSendMessage = async (req, res) => {
  const { key, panel_id, data, uid } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allUsers = await getDocs("users", panel_id);
  const user = allUsers.find((u) => u.api_key === key);

  if (!user) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    await addPanelDoc("supports_messages", data, panel_id);
    await updatePanelDoc(
      "supports",
      uid,
      { is_read_by_admin: false, status: "Waiting For Response" },
      panel_id
    );

    await sendEmail(
      undefined,
      "new_message",
      { ...data, user: user.username, ticket_id: data.ticket_id },
      panel_id
    );

    res.status(200).json({ success: "Sent Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserStatus = async (req, res) => {
  const { key, panel_id, ticket_id } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const ticketArr = await getDocs("supports", panel_id, {
      find: { field: "id", operator: "===", value: parseInt(ticket_id) },
    });
    const ticket = Array.isArray(ticketArr) ? ticketArr[0] : ticketArr;

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  const { key, panel_id, ticket_ids } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    for (const id of ticket_ids) {
      const ticketArr = await getDocs("supports", panel_id, {
        find: { field: "id", operator: "===", value: parseInt(id) },
      });
      const ticket = Array.isArray(ticketArr) ? ticketArr[0] : ticketArr;

      if (ticket) {
        await updatePanelDoc(
          "supports",
          ticket.uid,
          { is_read_by_admin: true },
          panel_id
        );
      }
    }

    res.status(200).json({ success: "Marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsSolved = async (req, res) => {
  const { key, panel_id, ticket_ids } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    for (const id of ticket_ids) {
      const ticketArr = await getDocs("supports", panel_id, {
        find: { field: "id", operator: "===", value: parseInt(id) },
      });
      const ticket = Array.isArray(ticketArr) ? ticketArr[0] : ticketArr;

      if (ticket) {
        await updatePanelDoc(
          "supports",
          ticket.uid,
          { status: "Solved" },
          panel_id
        );
      }
    }

    res.status(200).json({ success: "Marked as solved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTickets = async (req, res) => {
  const { key, panel_id, ticket_ids } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminExists = allAdmins.some((admin) => admin.api_key === key);

  if (!adminExists) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    for (const id of ticket_ids) {
      const ticketArr = await getDocs("supports", panel_id, {
        find: { field: "id", operator: "===", value: parseInt(id) },
      });
      const ticket = Array.isArray(ticketArr) ? ticketArr[0] : ticketArr;

      if (ticket) {
        await deletePanelDoc("supports", ticket.uid, panel_id);
      }
    }

    res.status(200).json({ success: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  const { key, panel_id, ticket_id } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing values" });
  }

  const allAdmins = getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === key);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const ticket = getDocs("supports", panel_id, {
      find: { field: "id", operator: "===", value: parseInt(ticket_id) },
    });
    const user = getDocs("users", panel_id, {
      find: { field: "uid", operator: "===", value: ticket.userId },
      removeKeys: ["password"],
    });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
