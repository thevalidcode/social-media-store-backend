const { getDocs, updatePanelDoc, addPanelDoc } = require("../crud");
const { checkapiKey } = require("../utils/checkapikey");
const { sendOrderToMainServer, updateOrderStatus } = require("../ApiSync");
const convertCurrency = require("../utils/ConvertCurrency");
const cheerio = require("cheerio");

const getLatestExchangeRates = async () => {
  const data = await getDocs("exchange_rates", null, {
    find: { field: "uid", operator: "===", value: "latest" },
  });
  return data?.quotes || { USD: 1 };
};

exports.apiFunctions = async (req, res) => {
  const { key, action } = req.body;
  if (!key || !action) {
    return res.status(400).json({ error: "Missing key or action" });
  }

  // Validate API key and extract panel_id
  const result = await checkapiKey(key);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  const panel_id = result.userData.panel_id;

  // Helper to clean service descriptions
  const getDescription = (desc) => {
    if (!desc) return "";
    const description = desc.replace(/&&n/g, "");
    const $ = cheerio.load(description);
    $("ul, ol, li").each((_, el) => {
      $(el).replaceWith($(el).html());
    });
    $("img, input, table").remove();
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      $(el).replaceWith(href);
    });
    return $.text().trim();
  };

  try {
    if (action === "services") {
      const services = await getDocs("services", panel_id);
      const rates = await getLatestExchangeRates();

      const formattedServices = services.map((data) => ({
        service: data.id,
        description: getDescription(data.description),
        name: data.name,
        type: data.type,
        category: data.category,
        rate: String(
          convertCurrency(data.price, data.provider_currency, "USD", rates)
        ),
        min: String(data.min),
        max: String(data.max),
        refill: data.refill,
        cancel: data.cancel,
      }));

      return res.json(formattedServices);
    }

    if (action === "status") {
      const { order, orders } = req.body;
      if (!order && !orders) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }

      const allOrders = await getDocs("orders", panel_id);

      if (order) {
        const orderData = allOrders.find(
          (o) => o.id === order || o.id === parseInt(order)
        );
        if (!orderData) {
          return res.status(404).json({ error: "Order not found" });
        }
        return res.json({
          charge: String(orderData.price),
          status: orderData.status,
          start_count: String(orderData.start),
          remains: String(orderData.remains),
          currency: orderData.currency,
        });
      }

      if (orders) {
        const orderIds = orders.split(",");
        const statusResults = {};

        for (const orderId of orderIds) {
          const idNum = parseInt(orderId, 10);
          const orderData = allOrders.find((o) => o.id === idNum);

          statusResults[orderId] = orderData
            ? {
                charge: String(orderData.price),
                status: orderData.status,
                start_count: String(orderData.start),
                remains: String(orderData.remains),
                currency: orderData.currency,
              }
            : { error: "Incorrect order ID" };
        }

        return res.json(statusResults);
      }
    }

    if (action === "refill_status") {
      const { refill, refills } = req.body;
      if (!refill && !refills) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }

      const allRefills = await getDocs("refills", panel_id);

      if (refill) {
        const refillData = allRefills.find(
          (r) => r.id === refill || r.id === parseInt(refill)
        );
        if (!refillData) {
          return res.status(404).json({ error: "Refill not found" });
        }
        return res.json({ status: refillData.status });
      }

      if (refills) {
        const refillIds = refills.split(",");
        const refillResults = [];

        for (const refillId of refillIds) {
          const idNum = parseInt(refillId, 10);
          const refillData = allRefills.find((r) => r.id === idNum);

          refillResults.push(
            refillData
              ? { refill: idNum, status: refillData.status }
              : { refill: idNum, status: { error: "Incorrect refill ID" } }
          );
        }

        return res.json(refillResults);
      }
    }

    if (action === "balance") {
      const users = await getDocs("users", panel_id);
      const user = users.find((u) => u.api_key === key);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({
        balance: String(user.balance),
        currency: user.currency,
      });
    }

    if (action === "cancel") {
      const { orders } = req.body;
      if (!orders)
        return res.status(400).json({ error: "Missing orders parameter" });

      const orderIds = orders.includes(",") ? orders.split(",") : [orders];
      const statusResults = [];

      for (const orderId of orderIds) {
        try {
          const ordersList = await getDocs("orders", panel_id);
          const orderData = ordersList.find((o) => o.id === parseInt(orderId));

          if (!orderData) {
            statusResults.push({
              order: parseInt(orderId),
              cancel: { error: "Incorrect order ID" },
            });
            continue;
          }


          // Insert cancel document
         const result = await addPanelDoc(
            "cancels",
            {
              order: parseInt(orderId),
            },
            panel_id
          );

          statusResults.push({ order: parseInt(orderId), cancel: result.id });
        } catch {
          statusResults.push({
            order: parseInt(orderId),
            cancel: { error: "Internal server error" },
          });
        }
      }

      return res.json(statusResults);
    }

    if (action === "add") {
      const { service, link, quantity } = req.body;
      if (!service || !link || !quantity) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }

      const services = await getDocs("services", panel_id);
      const serviceData = services.find(
        (s) => s.id === service || s.id === parseInt(service)
      );
      if (!serviceData) {
        return res.status(401).json({ error: "Invalid Service Id" });
      }

      const users = await getDocs("users", panel_id);
      const user = users.find((u) => u.api_key === key);
      if (!user) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      const orders = await getDocs("orders", panel_id);
      const latestOrder = orders.sort((a, b) => b.id - a.id)[0];
      const newOrderID = latestOrder ? latestOrder.id + 1 : 1;

      // Calculate price in provider currency then convert to USD
      const totalPriceProvider = (quantity / 1000) * serviceData.price;
      const rates = await getLatestExchangeRates();
      const totalPriceUSD = parseFloat(
        convertCurrency(
          totalPriceProvider,
          serviceData.provider_currency,
          "USD",
          rates
        )
      );

      if (user.balance < totalPriceUSD) {
        return res.status(200).json({ error: "Not enough funds on balance" });
      }

      const oldBalance = user.balance;
      const newBalance = oldBalance - totalPriceUSD;

      const orderData = {
        id: newOrderID,
        user_id: user.id,
        user_uid: user.uid,
        username: user.username,
        service: serviceData.name,
        category: serviceData.category,
        start: 0,
        currency: "USD",
        provider_service_id: serviceData.provider_id,
        user_initial_balance: oldBalance,
        user_final_balance: newBalance,
        status: "Failed",
        url: link,
        service_id: serviceData.id,
        provider: serviceData.provider,
        number: quantity,
        synced: true,
        sync_order: true,
        remains: 0,
        price: totalPriceUSD,
        timestamp: new Date(),
      };

      // Handle affiliate/referral commission if any
      if (user.ref) {
        const affiliateSettings = await getDocs("pages", panel_id, {
          find: { field: "uid", operator: "===", value: "affiliate" },
        });
        const percentage = affiliateSettings?.percent || 0;
        const refUserArr = await getDocs("users", panel_id, {
          find: { field: "id", operator: "===", value: user.ref },
        });
        const refUser = Array.isArray(refUserArr) ? refUserArr[0] : refUserArr;

        if (refUser) {
          const earned = (orderData.price * percentage) / 100;
          const newRefBalance = refUser.balance + earned;

          await addPanelDoc(
            "referrals_orders",
            {
              price: orderData.price,
              username: user.username,
              refId: user.ref,
            },
            panel_id
          );
          await updatePanelDoc(
            "users",
            refUser.uid,
            { balance: newRefBalance },
            panel_id
          );
          await addPanelDoc(
            "transactions",
            {
              status: "success",
              amount: earned,
              currency: "USD",
              payment_method: "Referral commission from order",
              user_id: refUser.id,
              timestamp: new Date(),
            },
            panel_id
          );
        }
      }

      // Insert new order
      await addPanelDoc("orders", orderData, panel_id);

      // Sync with main server if enabled
      if (serviceData.sync) {
        const result = await sendOrderToMainServer(orderData, panel_id);
        if (result.error) {
          return res
            .status(500)
            .json({ error: "Failed to sync with main server" });
        }
        await updateOrderStatus(orderData.id, result.order_id, panel_id);
      }

      return res.json({ order: newOrderID });
    }

    // Default fallback for unknown action
    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
