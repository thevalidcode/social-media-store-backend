const { getDocs } = require("../crud");

exports.getPanelId = async (req, res) => {
  const { domain } = req.body;
  try {
    const registeredPanels = await getDocs("registered_panels");
    const panel = registeredPanels.find((site) => site.uid === domain);
    if (!panel) {
      return res
        .status(404)
        .send({ error: "Panel not found for the given domain" });
    }
    return res.status(200).send({ panel_id: panel.panel_id });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getStyles = async (req, res) => {
  const { panel_id } = req.body;
  try {
    const design = await getDocs("design", panel_id, {
      find: { field: "uid", operator: "===", value: "design" },
    });
    return res.status(200).send(design);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getSiteData = async (req, res) => {
  const { panel_id } = req.body;
  try {
    const general = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });
    return res.status(200).send(general);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getRates = async (req, res) => {
  try {
    const exchangeRatesData = await getDocs("exchange_rates", null, {
      find: { field: "uid", operator: "===", value: "latest" },
    });
    return res.status(200).send(exchangeRatesData.quotes);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  const { panel_id, uid } = req.body;
  try {
    const users = await getDocs("users", panel_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password"],
    });
    if (!users) {
      return res.status(404).send({ error: "User not found" });
    }
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getCurrentAdmin = async (req, res) => {
  const { panel_id, uid } = req.body;
  try {
    const admins = await getDocs("admins", panel_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password"],
    });
    if (!admins) {
      return res.status(404).send({ error: "Admin not found" });
    }
    return res.status(200).send(admins);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
