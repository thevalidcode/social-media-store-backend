const convertCurrency = require("../utils/ConvertCurrency");
const { getDocs } = require("../crud");
const { checkKey } = require("../utils/checkapikey");

const getExchangeRates = async () => {
  const data = await getDocs("exchange_rates", null, {
    find: { field: "uid", operator: "===", value: "latest" },
  });
  return data?.quotes || { USD: 1 };
};

exports.getHomeData = async (req, res) => {
  try {
    const { panel_id } = req.body;
    const pages = await getDocs("pages", panel_id);
    const homePage = pages.find((page) => page.uid === "home") || null;
    return res.status(200).json({ data: homePage });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  const { panel_id, key, uid } = req.body;

  const response = checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    // Fetch all needed data concurrently
    const [transactionsRaw, ordersRaw, usersRaw] = await Promise.all([
      getDocs("transactions", panel_id, {
        filter: { field: "user_id", operator: "===", value: uid },
      }),
      getDocs("orders", panel_id, {
        filter: { field: "user_uid", operator: "===", value: uid },
      }),
      getDocs("users", panel_id, {
        find: { field: "uid", operator: "===", value: uid },
      }),
    ]);

    const transactions = transactionsRaw.filter(
      (t) => t.status === "success" && t.balanceAction !== "remove"
    );

    const orders = ordersRaw || [];
    const user = usersRaw.length > 0 ? usersRaw[0] : {};

    const userOrders = orders.length;
    const failedOrders = orders.filter((o) => o.status === "Failed").length;

    // Helper to get latest order id from all orders for the panel
    const getPanelOrders = async () => {
      const allOrders = await getDocs("orders", panel_id);
      if (!allOrders.length) return 0;
      const filtered = allOrders.filter((doc) => doc.id != null);
      const sorted = filtered.sort((a, b) => b.id - a.id);
      return sorted[0].id || 0;
    };

    // Get recent orders and services combined
    const getRecentOrdersAndServices = async () => {
      const [recentOrders, services] = await Promise.all([
        getDocs("orders", panel_id, {
          filter: { field: "user_uid", operator: "===", value: uid },
          removeKeys: [
            "provider",
            "provider_service_id",
            "provider_order_id",
            "synced",
            "user_id",
            "user_uid",
          ],
        }),
        getDocs("services", panel_id, {
          removeKeys: [
            "provider_price",
            "sync_cat_and_name",
            "sync_quantity",
            "uid",
            "panel_id",
            "percentage",
            "provider",
            "provider_id",
          ],
        }),
      ]);

      const sortedOrders = recentOrders
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 5);

      const sortedServices = services
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 5);

      return [...sortedOrders, ...sortedServices];
    };

    // Fetch exchange rates once for conversions
    const rates = await getExchangeRates();

    // Calculate revenue growth per month
    const calculateRevenueGrowthData = () => {
      const revenueByMonth = {};

      for (const transaction of transactions) {
        const date = new Date(transaction.timestamp);
        const monthYear = `${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;
        revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + convertCurrency(
          transaction.amount,
          transaction.currency || "USD",
          "USD",
          rates
        );
      }

      const revenueGrowthData = Object.entries(revenueByMonth).map(([monthYear, amount]) => {
        const [month, year] = monthYear.split("-");
        return {
          month: new Date(year, month - 1).toLocaleString("default", { month: "short" }),
          amount,
        };
      });

      return revenueGrowthData.sort((a, b) => new Date(`${a.month} 1`) - new Date(`${b.month} 1`));
    };

    // Calculate orders trend per month
    const calculateOrdersTrendsData = () => {
      const ordersByMonth = {};

      for (const order of orders) {
        const date = new Date(order.timestamp);
        const monthYear = `${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;
        ordersByMonth[monthYear] = (ordersByMonth[monthYear] || 0) + 1;
      }

      const ordersTrendsData = Object.entries(ordersByMonth).map(([monthYear, count]) => {
        const [month, year] = monthYear.split("-");
        return {
          month: new Date(year, month - 1).toLocaleString("default", { month: "short" }),
          orders: count,
        };
      });

      return ordersTrendsData.sort((a, b) => new Date(`${a.month} 1`) - new Date(`${b.month} 1`));
    };

    const [revenueGrowthData, ordersTrendsData, panelOrders, recentActivity] = await Promise.all([
      Promise.resolve(calculateRevenueGrowthData()),
      Promise.resolve(calculateOrdersTrendsData()),
      getPanelOrders(),
      getRecentOrdersAndServices(),
    ]);

    return res.json({
      revenueGrowthData,
      ordersTrendsData,
      panelOrders,
      userOrders,
      recentActivity,
      failedOrders,
      userSpent: user.spent || 0,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAffiliateData = async (req, res) => {
  const { panel_id, key } = req.body;

  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const affiliate = await getDocs("pages", panel_id, {
      find: { field: "uid", operator: "===", value: "affiliate" },
    });
    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate data not found" });
    }
    return res.status(200).json({
      percent: affiliate.percent || 0,
      enabled: !!affiliate.enabled,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRaeData = async (req, res) => {
  const { panel_id, key } = req.body;

  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const [affiliate, refills] = await Promise.all([
      getDocs("pages", panel_id, {
        find: { field: "uid", operator: "===", value: "affiliate" },
      }),
      getDocs("refills", panel_id),
    ]);

    const enabledPages = [];
    if (affiliate && affiliate.enabled) enabledPages.push("affiliate");
    if (Array.isArray(refills) && refills.length > 0) enabledPages.push("refills");

    return res.status(200).json({ enabled: enabledPages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getReferrals = async (req, res) => {
  const { panel_id, key, user_id } = req.body;

  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const referrals = await getDocs("referrals", panel_id);

    if (!Array.isArray(referrals)) {
      return res.status(200).json({ orders: [], totalReferrals: 0, totalEarnings: 0 });
    }

    const totalReferrals = referrals.filter((ref) => ref.user_id).length;

    const affiliate = await getDocs("pages", panel_id, {
      find: { field: "uid", operator: "===", value: "affiliate" },
    });

    const percentage = affiliate?.percent || 0;

    let orders = [];
    let totalEarnings = 0;

    for (const doc of referrals) {
      if (Array.isArray(doc.orders)) {
        const filteredOrders = doc.orders
          .filter((order) => order.refId === parseInt(user_id))
          .map((order) => {
            const earned = (order.price * percentage) / 100;
            totalEarnings += earned;
            return { ...order, earned };
          });

        if (filteredOrders.length > 0) {
          orders = filteredOrders;
          break;
        }
      }
    }

    return res.status(200).json({ orders, totalReferrals, totalEarnings });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
