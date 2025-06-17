const { getDocs } = require("../crud");
const convertCurrency = require("../utils/ConvertCurrency");
const { checkKey } = require("../utils/checkapikey");

const exchange_rates = async () => {
  const data = await getDocs("exchange_rates", null, {
    find: { field: "uid", operator: "===", value: "latest" },
  });
  return data.quotes || { USD: 1 };
};

exports.getStatistics = async (req, res) => {
  const { panel_id, key } = req.body;

  const response = checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).send({ error: "Invalid API key" });
  }

  try {
    const users = await getDocs("users", panel_id);
    const transactionsDocs = await getDocs("transactions", panel_id);
    const transactions = [...transactionsDocs]
      .sort((a, b) => b.id - a.id)
      .map((trans) => {
        const user = [...users].find((user) => user.uid === trans.user_id);
        return { ...trans, user: user.username };
      });
    const orders = await getDocs("orders", panel_id);
    const completedOrdersDocs = await getDocs("orders", panel_id, {
      filter: { field: "status", operator: "===", value: "Completed" },
    });
    const cancelledOrdersDocs = await getDocs("orders", panel_id, {
      filter: { field: "status", operator: "===", value: "Canceled" },
    });
    const calculateRevenueGrowthData = () => {
      const revenueByMonth = {};

      transactionsDocs.forEach((transaction) => {
        const date = new Date(transaction.timestamp);
        const monthYear = `${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;

        if (!revenueByMonth[monthYear]) {
          revenueByMonth[monthYear] = 0;
        }
        revenueByMonth[monthYear] += convertCurrency(
          transaction.amount,
          transaction.currency || "USD",
          "USD",
          exchange_rates()
        );
      });

      const revenueGrowthData = Object.keys(revenueByMonth).map((monthYear) => {
        const [month, year] = monthYear.split("-");
        return {
          month: new Date(year, month - 1).toLocaleString("default", {
            month: "short",
          }),
          revenue: revenueByMonth[monthYear],
        };
      });

      // Sort the data by month
      return revenueGrowthData.sort(
        (a, b) =>
          new Date(`01-${a.month}-${new Date().getFullYear()}`) -
          new Date(`01-${b.month}-${new Date().getFullYear()}`)
      );
    };
    const calculateUsersTrendsData = () => {
      const usersByMonth = {};

      users.forEach((order) => {
        const date = new Date(order.timestamp);
        const monthYear = `${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;

        if (!usersByMonth[monthYear]) {
          usersByMonth[monthYear] = 0;
        }
        usersByMonth[monthYear] += 1;
      });

      const userTrendsData = Object.keys(usersByMonth).map((monthYear) => {
        const [month, year] = monthYear.split("-");
        return {
          month: new Date(year, month - 1).toLocaleString("default", {
            month: "short",
          }),
          users: usersByMonth[monthYear],
        };
      });

      return userTrendsData.sort(
        (a, b) =>
          new Date(`01-${a.month}-${new Date().getFullYear()}`) -
          new Date(`01-${b.month}-${new Date().getFullYear()}`)
      );
    };
    const calculateOrdersTrendsData = () => {
      const ordersByMonth = {};

      orders.forEach((order) => {
        const date = new Date(order.timestamp);
        const monthYear = `${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;

        if (!ordersByMonth[monthYear]) {
          ordersByMonth[monthYear] = 0;
        }
        ordersByMonth[monthYear] += 1;
      });

      const orderTrendsData = Object.keys(ordersByMonth).map((monthYear) => {
        const [month, year] = monthYear.split("-");
        return {
          month: new Date(year, month - 1).toLocaleString("default", {
            month: "short",
          }),
          orders: ordersByMonth[monthYear],
        };
      });

      return orderTrendsData.sort(
        (a, b) =>
          new Date(`01-${a.month}-${new Date().getFullYear()}`) -
          new Date(`01-${b.month}-${new Date().getFullYear()}`)
      );
    };
    const calculateCompletedOrdersTrendsData = () => {
      const ordersByMonth = {};

      completedOrdersDocs.forEach((order) => {
        const date = new Date(order.timestamp);
        const monthYear = `${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;

        if (!ordersByMonth[monthYear]) {
          ordersByMonth[monthYear] = 0;
        }
        ordersByMonth[monthYear] += 1;
      });

      const orderTrendsData = Object.keys(ordersByMonth).map((monthYear) => {
        const [month, year] = monthYear.split("-");
        return {
          month: new Date(year, month - 1).toLocaleString("default", {
            month: "short",
          }),
          orders: ordersByMonth[monthYear],
        };
      });

      return orderTrendsData.sort(
        (a, b) =>
          new Date(`01-${a.month}-${new Date().getFullYear()}`) -
          new Date(`01-${b.month}-${new Date().getFullYear()}`)
      );
    };
    const calculateCancelledOrdersTrendsData = () => {
      const ordersByMonth = {};

      cancelledOrdersDocs.forEach((order) => {
        const date = new Date(order.timestamp);
        const monthYear = `${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;

        if (!ordersByMonth[monthYear]) {
          ordersByMonth[monthYear] = 0;
        }
        ordersByMonth[monthYear] += 1;
      });

      const orderTrendsData = Object.keys(ordersByMonth).map((monthYear) => {
        const [month, year] = monthYear.split("-");
        return {
          month: new Date(year, month - 1).toLocaleString("default", {
            month: "short",
          }),
          orders: ordersByMonth[monthYear],
        };
      });

      return orderTrendsData.sort(
        (a, b) =>
          new Date(`01-${a.month}-${new Date().getFullYear()}`) -
          new Date(`01-${b.month}-${new Date().getFullYear()}`)
      );
    };
    const ordersPlaced = calculateOrdersTrendsData();
    const completedOrders = calculateCompletedOrdersTrendsData();
    const cancelledOrders = calculateCancelledOrdersTrendsData();
    const incomeReceived = calculateRevenueGrowthData();
    const registeredUsers = calculateUsersTrendsData();
    return res.status(200).send({
      ordersPlaced,
      completedOrders,
      cancelledOrders,
      incomeReceived,
      transactions,
      registeredUsers,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
