const {
  getDocs,
  addPanelDoc,
  deletePanelDoc,
  updatePanelDoc,
} = require("../crud");
const { sendEmail } = require("../utils/emails");
const axios = require("axios");
const convertCurrency = require("../utils/ConvertCurrency");
const { decryptKey, encryptKey } = require("../utils/encrypt");

const exchange_rates = async () => {
  const data = await getDocs("exchange_rates", null, {
    find: { field: "uid", operator: "===", value: "latest" },
  });
  return data.quotes || { USD: 1 };
};

exports.getGateways = async (req, res) => {
  const { uid, panel_id } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  const allUsers = await getDocs("users", panel_id);
  const userSnapshot = allUsers.some((user) => user.uid === uid);

  if (!userSnapshot) {
    return res.status(401).json({ error: "Invalid key" });
  }

  try {
    const payment_gateways = await getDocs("payment_gateways", panel_id, {
      removeKeys: ["secret_key"],
    });
    const activepayment_gateways = payment_gateways.filter(
      (gateway) => gateway.status === "active"
    );

    if (activepayment_gateways.length !== 0) {
      const gateways = activepayment_gateways.map((doc) => ({
        value: doc.platform,
        label: doc.name,
        description: doc.description,
        image: doc.image,
        min: doc.min,
        max: doc.max,
      }));
      res.status(200).send(gateways);
    } else {
      res.status(400).send("No active payment gateways found.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllGateways = async (req, res) => {
  const { adminKey, panel_id } = req.body;

  if (!adminKey) {
    return res.status(400).json({ error: "Missing adminKey" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const payment_gateways = await getDocs("payment_gateways", panel_id, {
      removeKeys: ["secret_key"],
    });

    if (payment_gateways.length !== 0) {
      const gateways = payment_gateways.map((doc) => ({
        value: doc.platform,
        label: doc.name,
        ...doc,
      }));
      res.status(200).send(gateways);
    } else {
      res.status(400).send("No payment gateways found.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllGatewayById = async (req, res) => {
  const { uid, adminKey, panel_id } = req.body;

  if (!uid || !adminKey) {
    return res.status(400).json({ error: "Missing uid or key" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const payment_gateways = await getDocs("payment_gateways", panel_id, {
      removeKeys: ["secret_key"],
    });
    const filteredGateways = payment_gateways.filter(
      (gateway) => gateway.uid === uid
    );

    if (filteredGateways.length !== 0) {
      const gateways = filteredGateways.map((doc) => ({
        value: doc.platform,
        label: doc.name,
        ...doc,
      }));
      res.status(200).send(gateways);
    } else {
      res.status(400).send("No active payment gateways found.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGateway = async (req, res) => {
  const {
    uid,
    adminKey,
    gatewayPlatform,
    min,
    max,
    name,
    payment_description,
    description,
    secret_key,
    panel_id,
    status,
  } = req.body;

  if (!uid || !adminKey) {
    return res.status(400).json({ error: "Missing some params" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const payment_gateways = await getDocs("payment_gateways", panel_id);
    const gatewayIndex = payment_gateways.find(
      (gateway) => gateway.uid === uid
    );

    if (gatewayIndex.length !== 0) {
      const gatewayData = {
        min: min,
        max: max,
        name: name,
        status: status,
        description: description,
      };

      const encrypted_key = encryptKey(secret_key);
      if (gatewayPlatform === "flutterwave") {
        gatewayData["secret_key"] = encrypted_key;
        gatewayData["payment_description"] = payment_description;
      } else if (gatewayPlatform === "paystack") {
        gatewayData["secret_key"] = encrypted_key;
      } else if (gatewayPlatform !== "manual") {
        return res.status(400).json({ error: "Unsupported payment platform" });
      }

      await updatePanelDoc("payment_gateways", uid, gatewayData, panel_id);
      res.status(200).send({ success: "Updated Successfully" });
    } else {
      res.status(400).send("Gateway not found.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addGateway = async (req, res) => {
  const {
    adminKey,
    platform,
    min,
    max,
    status,
    name,
    payment_description,
    description,
    image,
    secret_key,
    panel_id,
  } = req.body;

  if (!adminKey) {
    return res.status(400).json({ error: "Missing some params" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const encrypted_key = encryptKey(secret_key);

  try {
    const gatewayData = {
      min,
      max,
      payment_description,
      platform,
      status,
      image,
      secret_key: encrypted_key,
      name,
      description,
    };

    await addPanelDoc("payment_gateways", gatewayData, panel_id);
    return res.status(200).send({ success: "Added Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGateway = async (req, res) => {
  const { uid, adminKey, panel_id } = req.body;

  if (!uid || !adminKey) {
    return res.status(400).json({ error: "Missing uid or key" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    await await deletePanelDoc("payment_gateways", uid, panel_id);
    res.status(200).send({ success: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPayment = async (req, res) => {
  const { api_key, panel_id, platform, currency, amount, domain } = req.body;

  const allUsers = await getDocs("users", panel_id);
  const user = allUsers.find((admin) => admin.api_key === api_key);

  const gateway = await getDocs("payment_gateways", panel_id, {
    find: { field: "platform", operator: "===", value: platform },
  });

  const general = await getDocs("general", panel_id, {
    find: { field: "uid", operator: "===", value: "site" },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  const paymentData = {
    tx_ref: Date.now(),
    amount: amount,
    currency: currency,
    redirect_url: `https://${domain}/pay`,
    payment_options:
      "card, ussd, mobilemoney, mobilemoneyghana, mobilemoneyrwanda, mobilemoneyzambia, mobilemoneyuganda, mpesa, voucher, banktransfer, barter, payattitude, qrcode, eNaira, applepay, googlepay",
    customer: {
      email: user.email,
      name: user.username,
    },
    customizations: {
      title: general.title,
      description: gateway.payment_description,
      logo: general.logo_url,
    },
  };

  try {
    if (platform === "flutterwave") {
      const response = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${decryptKey(
              gateway.secret_key.encrypted_key,
              gateway.secret_key.iv
            )}`,
          },
        }
      );
      return res.json({ status: "success", url: response.data.data.link });
    }
    if (platform === "paystack") {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: paymentData.customer.email,
          amount: paymentData.amount * 100,
          currency: paymentData.currency,
          callback_url: paymentData.redirect_url,
        },
        {
          headers: {
            Authorization: `Bearer ${decryptKey(
              gateway.secret_key.encrypted_key,
              gateway.secret_key.iv
            )}`,
          },
        }
      );

      return res.json({
        status: "success",
        url: response.data.data.authorization_url,
      });
    }
    return res.status(400).json({ error: "Unsupported payment platform" });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).send({ status: "error", error: error.message });
  }
};

const handleFlutterwaveSuccessPayment = async (data, customer, panel_id) => {
  const user = await getDocs("users", panel_id, {
    find: { field: "email", operator: "===", value: customer.email },
  });
  try {
    const transData = {
      status: "success",
      amount: data.charged_amount,
      payment_method: "Flutterwave",
      transaction_id: data.id,
      currency: data.currency,
      charged_amount: data.charged_amount,
      user_id: user.uid,
      timestamp: new Date(),
    };
    await addPanelDoc("transactions", transData, panel_id);
    const userBalance = user.balance;
    const convertedcurrency = convertCurrency(
      data.charged_amount,
      data.currency,
      "USD",
      exchange_rates()
    );
    const usdPrice = parseFloat(userBalance) + parseFloat(convertedcurrency);
    const mainPrice = usdPrice.toFixed(3);
    await updatePanelDoc(
      "users",
      user.uid,
      { balance: parseFloat(mainPrice) },
      panel_id
    );

    await sendEmail(
      undefined,
      "funds_added",
      {
        panel_id,
        method: "Flutterwave",
        amount: parseFloat(convertedcurrency),
        timestamp: new Date(),
        username: user.username,
        currency: exchange_rates(),
      },
      panel_id
    );
  } catch (error) {
    console.log(error);
  }
  return;
};

const handleFlutterwaveFailedPayments = async (data, customer, panel_id) => {
  const user = await getDocs("users", panel_id, {
    find: { field: "email", operator: "===", value: customer.email },
  });
  const transData = {
    status: data.status,
    amount: data.charged_amount,
    payment_method: "Flutterwave",
    transaction_id: data.id,
    currency: data.currency,
    charged_amount: data.charged_amount,
    user_id: user.uid,
    timestamp: new Date(),
  };
  await addPanelDoc("transactions", transData, panel_id);
};

exports.flutterwavePaymentWebhook = (req, res) => {
  const { panel_id } = req.params;
  const event = req.body;
  if (event.status === "successful") {
    handleFlutterwaveSuccessPayment(event, event.customer, panel_id);
  } else if (
    event.status === "failed" ||
    event.status === "reversed" ||
    event.status === "cancelled"
  ) {
    handleFlutterwaveFailedPayments(event, event.customer, panel_id);
  } else {
    console.log("Unhandled event:", event.event);
  }

  res.sendStatus(200);
};

const handlePaystackSuccessPayment = async (data, customer, panel_id) => {
  const user = await getDocs("users", panel_id, {
    find: { field: "email", operator: "===", value: customer.email },
  });

  try {
    const transData = {
      status: "success",
      amount: data.amount / 100, // Paystack amounts are in kobo/lowest denomination
      payment_method: "Paystack",
      transaction_id: data.id,
      currency: data.currency,
      charged_amount: data.amount / 100,
      user_id: user.uid,
      timestamp: new Date(),
    };
    await addPanelDoc("transactions", transData, panel_id);

    const userBalance = user.balance;
    const convertedCurrency = convertCurrency(
      data.amount / 100,
      data.currency,
      "USD",
      exchange_rates()
    );
    const usdPrice = parseFloat(userBalance) + parseFloat(convertedCurrency);
    const mainPrice = usdPrice.toFixed(3);

    await updatePanelDoc(
      "users",
      user.uid,
      { balance: parseFloat(mainPrice) },
      panel_id
    );

    await sendEmail(
      undefined,
      "funds_added",
      {
        panel_id,
        method: "Paystack",
        amount: parseFloat(convertedCurrency),
        timestamp: new Date(),
        username: user.username,
        currency: exchange_rates(),
      },
      panel_id
    );
  } catch (error) {
    console.error("Error processing payment:", error);
  }
};

const handlePaystackFailedPayments = async (data, customer, panel_id) => {
  const user = await getDocs("users", panel_id, {
    find: { field: "email", operator: "===", value: customer.email },
  });

  const transData = {
    status: data.status,
    amount: data.amount / 100,
    payment_method: "Paystack",
    transaction_id: data.id,
    currency: data.currency,
    charged_amount: data.amount / 100,
    user_id: user.uid,
    timestamp: new Date(),
  };
  await addPanelDoc("transactions", transData, panel_id);
};

exports.paystackPaymentWebhook = (req, res) => {
  const { panel_id } = req.params;
  const event = req.body;

  if (event.event === "charge.success") {
    handlePaystackSuccessPayment(event.data, event.data.customer, panel_id);
  } else if (
    event.event === "charge.failed" ||
    event.event === "charge.reversed"
  ) {
    handlePaystackFailedPayments(event.data, event.data.customer, panel_id);
  } else {
    console.log("Unhandled event:", event.event);
  }

  res.sendStatus(200);
};
