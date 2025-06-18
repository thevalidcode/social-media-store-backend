import { getDocs } from "../crud.js";

export const getPanelId = async (req, res) => {
  const { domain } = req.query;
  try {
    const registeredPanels = await getDocs("registered_panels");
    const panel = registeredPanels.find((site) => site.uid === domain);
    if (!panel) {
      return res
        .status(404)
        .json({ error: "Panel not found for the given domain" });
    }
    return res.json({ panel_id: panel.panel_id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getStyles = async (req, res) => {
  const { panel_id } = req.query;
  try {
    const design = await getDocs("design", panel_id, {
      find: { field: "uid", operator: "===", value: "design" },
    });
    return res.json(design);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSiteData = async (req, res) => {
  const { panel_id } = req.query;
  try {
    const general = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });
    return res.json(general);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRates = async (req, res) => {
  try {
    const exchangeRatesData = await getDocs("exchange_rates", null, {
      find: { field: "uid", operator: "===", value: "latest" },
    });
    return res.json(exchangeRatesData.quotes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  const { panel_id } = req.auth;
  const { uid } = req.query;

  try {
    const users = await getDocs("users", panel_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password"],
    });
    if (!users) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCurrentAdmin = async (req, res) => {
  const { panel_id, role } = req.auth;
  const { uid } = req.query;

  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  try {
    const admins = await getDocs("admins", panel_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password"],
    });
    if (!admins) {
      return res.status(404).json({ error: "Admin not found" });
    }
    return res.json(admins);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
