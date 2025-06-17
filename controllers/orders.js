const { sendOrderToMainServer, updateOrderStatus } = require("../ApiSync");
const { getDocs, updatePanelDoc, addPanelDoc } = require("../crud");
const { checkKey } = require("../utils/checkapikey");

async function validateApiKey(key, panel_id, res) {
  if (!key) {
    res.status(400).json({ error: "Missing key" });
    return false;
  }
  const allAdmins = await getDocs("admins", panel_id);
  const valid = allAdmins.some((admin) => admin.api_key === key);
  if (!valid) {
    res.status(401).json({ error: "Invalid API key" });
    return false;
  }
  return true;
}

exports.sendOrderToMainServer = async (req, res) => {
  const { orderData, panel_id, user_uid, userBal } = req.body;
  if (!orderData) {
    return res.status(400).json({ error: "Missing orderData" });
  }
  try {
    if (orderData.drip_feed) {
      return res.status(200).send({ response: "Sent to server" });
    }
    const [serviceData] = await getDocs("services", panel_id, {
      find: { field: "name", operator: "===", value: orderData.service },
    });
    if (!serviceData) {
      return res.status(400).json({ error: "Service not found" });
    }
    const [user] = await getDocs("users", panel_id, {
      find: { field: "uid", operator: "===", value: user_uid },
    });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.ref) {
      const [affiliate] = await getDocs("pages", panel_id, {
        find: { field: "uid", operator: "===", value: "affiliate" },
      });
      const percentage = affiliate?.percent || 0;

      const [refUser] = await getDocs("users", panel_id, {
        find: { field: "id", operator: "===", value: user.ref },
      });
      if (refUser) {
        const earned = (orderData.price * percentage) / 100;
        const newBalance = (refUser.balance || 0) + earned;

        await addPanelDoc(
          "referrals_orders",
          { price: orderData.price, username: user.username, refId: user.ref },
          panel_id
        );
        await updatePanelDoc(
          "users",
          refUser.uid,
          { balance: newBalance },
          panel_id
        );
        await addPanelDoc(
          "transactions",
          {
            status: "success",
            amount: earned,
            currency: "USD",
            payment_method: "Amount earned from your referral's order.",
            user_id: user.uid,
            timestamp: new Date(),
          },
          panel_id
        );
      }
    }

    orderData.provider = serviceData.provider;
    orderData.sync_order = true;
    orderData.provider_service_id = serviceData.provider_id;

    const new_order = await addPanelDoc("orders", orderData, panel_id);
    const orderUid = new_order.uid;
    orderData.uid = orderUid;

    await updatePanelDoc("users", user_uid, { balance: userBal }, panel_id);

    const success = await sendOrderToMainServer(
      orderData,
      panel_id,
      serviceData
    );

    if (success) {
      await updateOrderStatus(orderData.uid, panel_id);
    }

    return res.status(200).send({ response: "Sent to server" });
  } catch (error) {
    return res.status(400).send({ error: error.message || error.toString() });
  }
};

exports.resendOrder = async (req, res) => {
  const { orderData, panel_id } = req.body;
  if (!orderData) {
    return res.status(400).json({ error: "Missing orderData" });
  }
  try {
    const [serviceData] = await getDocs("services", panel_id, {
      find: { field: "name", operator: "===", value: orderData.service },
    });
    if (!serviceData) {
      return res.status(400).json({ error: "Service not found" });
    }

    const success = await sendOrderToMainServer(
      orderData,
      panel_id,
      serviceData
    );

    if (success) {
      await updateOrderStatus(orderData.uid, panel_id);
    }

    res.status(200).send({ response: "Sent to server" });
  } catch (error) {
    res.status(400).send({ error: error.message || error.toString() });
  }
};

async function fetchOrdersWithAuth(req, res) {
  const { key, panel_id } = req.body;
  if (!(await validateApiKey(key, panel_id, res))) return;

  try {
    const ordersData = await getDocs("orders", panel_id);
    const sortedWithDateOrders = ordersData.sort((a, b) => b.id - a.id);
    res.status(200).send(sortedWithDateOrders);
  } catch (error) {
    res.status(400).send({ error: error.message || error.toString() });
  }
}
exports.fetchOrders = fetchOrdersWithAuth;

async function fetchOrdersCountByStatus(req, res, status) {
  const { key, panel_id } = req.body;
  if (!(await validateApiKey(key, panel_id, res))) return;

  try {
    const orders = await getDocs("orders", panel_id);
    const size =
      status === "all"
        ? orders.length
        : orders.filter((o) => o.status === status).length;
    res.status(200).send({ size });
  } catch (error) {
    res.status(400).send({ error: error.message || error.toString() });
  }
}

exports.fetchPendingSize = (req, res) =>
  fetchOrdersCountByStatus(req, res, "Pending");
exports.fetchActiveSize = (req, res) =>
  fetchOrdersCountByStatus(req, res, "In progress");
exports.fetchFailedSize = (req, res) =>
  fetchOrdersCountByStatus(req, res, "Failed");
exports.fetchPartialSize = (req, res) =>
  fetchOrdersCountByStatus(req, res, "Partial");
exports.fetchCancelledSize = (req, res) =>
  fetchOrdersCountByStatus(req, res, "Canceled");
exports.fetchCompletedSize = (req, res) =>
  fetchOrdersCountByStatus(req, res, "Completed");
exports.fetchOrdersSize = (req, res) =>
  fetchOrdersCountByStatus(req, res, "all");

exports.editOrder = async (req, res) => {
  const { action, key, panel_id } = req.body;

  if (!key || !action) {
    return res.status(400).json({ error: "Missing key or action" });
  }

  if (!(await validateApiKey(key, panel_id, res))) return;

  const orders = await getDocs("orders", panel_id);

  async function completeOrder() {
    const { uid, status, user_uid, service_id, quantity, remains } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const user = (await getDocs("users", panel_id)).find(
      (u) => u.uid === user_uid
    );
    if (!user) return res.status(400).json({ error: "User not found" });

    const service = (await getDocs("services", panel_id)).find(
      (s) => s.id === service_id
    );
    if (!service) return res.status(400).json({ error: "Service not found" });

    const pricePer1000 = service.price;
    let totalPrice, newBalance;

    if (status === "Cancelled") {
      totalPrice = ((quantity / 1000) * pricePer1000).toFixed(3);
      newBalance = parseFloat(user.balance) - parseFloat(totalPrice);
      await updatePanelDoc(
        "users",
        user_uid,
        { balance: newBalance },
        panel_id
      );
    } else if (status === "Partial") {
      const order = orders.find((o) => o.uid === uid);
      if (!order) return res.status(400).json({ error: "Order not found" });

      const originalPrice = ((order.number / 1000) * pricePer1000).toFixed(3);
      totalPrice = ((remains / 1000) * pricePer1000).toFixed(3);
      newBalance = parseFloat(user.balance) - parseFloat(totalPrice);
      await updatePanelDoc(
        "users",
        user_uid,
        { balance: newBalance },
        panel_id
      );

      await updatePanelDoc(
        "orders",
        uid,
        { status: "Completed", remains: 0, price: parseFloat(originalPrice) },
        panel_id
      );
    } else {
      const order = orders.find((o) => o.uid === uid);
      if (!order) return res.status(400).json({ error: "Order not found" });

      await updatePanelDoc(
        "orders",
        uid,
        { status: "Completed", remains: 0 },
        panel_id
      );
    }
    return res.status(200).send({ message: "Updated Successfully" });
  }

  async function cancelOrder() {
    const { uid, user_uid } = req.body;
    if (!uid || !user_uid)
      return res.status(400).json({ error: "Missing uid or user_uid" });

    const order = orders.find((o) => o.uid === uid);
    if (!order) return res.status(400).json({ error: "Order not found" });

    const user = (await getDocs("users", panel_id)).find(
      (u) => u.uid === user_uid
    );
    if (!user) return res.status(400).json({ error: "User not found" });

    const newBalance = parseFloat(user.balance) + parseFloat(order.price);
    await updatePanelDoc("users", user_uid, { balance: newBalance }, panel_id);
    await updatePanelDoc(
      "orders",
      uid,
      { status: "Canceled", price: 0 },
      panel_id
    );

    return res.status(200).send({ message: "Updated Successfully" });
  }

  async function cancelOrderPartially() {
    const { uid, user_uid, amount, service_id } = req.body;
    if (!uid || !user_uid)
      return res.status(400).json({ error: "Missing uid or user_uid" });

    const order = orders.find((o) => o.uid === uid);
    if (!order) return res.status(400).json({ error: "Order not found" });

    const service = (await getDocs("services", panel_id)).find(
      (s) => s.id === service_id
    );
    if (!service) return res.status(400).json({ error: "Service not found" });

    const pricePer1000 = service.price;
    const refundingAmount = parseFloat(order.number) - parseFloat(amount);
    const totalPrice = ((amount / 1000) * pricePer1000).toFixed(3);
    const orderPrice = ((refundingAmount / 1000) * pricePer1000).toFixed(3);

    const user = (await getDocs("users", panel_id)).find(
      (u) => u.uid === user_uid
    );
    if (!user) return res.status(400).json({ error: "User not found" });

    const newBalance = parseFloat(user.balance) + parseFloat(totalPrice);
    await updatePanelDoc("users", user_uid, { balance: newBalance }, panel_id);

    await updatePanelDoc(
      "orders",
      uid,
      {
        status: "Partial",
        remains: refundingAmount,
        price: parseFloat(orderPrice),
      },
      panel_id
    );

    return res.status(200).send({ message: "Updated Successfully" });
  }

  switch (action) {
    case "complete":
      return completeOrder();
    case "cancel":
      return cancelOrder();
    case "cancel_partially":
      return cancelOrderPartially();
    default:
      return res.status(400).json({ error: "Invalid action" });
  }
};
