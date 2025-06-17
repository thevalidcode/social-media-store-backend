const {
  getDocs,
  addPanelDoc,
  updatePanelDoc,
  deletePanelDoc,
} = require("../crud");
const axios = require("axios");

exports.getServices = async (req, res) => {
  const { adminKey, provider, key, panel_id } = req.body;

  if (!key || !panel_id || !provider) {
    return res.status(400).json({ error: "Missing some values" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const data = {
      action: "services",
      key: key,
    };
    const url = `https://${provider}/api/v2`;
    const response = await axios.post(url, data);
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProviders = async (req, res) => {
  const { adminKey, panel_id } = req.body;

  if (!adminKey) {
    return res.status(400).json({ error: "Missing uid or key" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const providers = await getDocs("providers", panel_id);

    if (providers.length !== 0) {
      res.status(200).send(providers);
    } else {
      res.status(400).send("No provider found.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProvidersById = async (req, res) => {
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
    const providers = await getDocs("providers", panel_id);
    const provider = providers.find((provider) => provider.uid === uid);

    if (provider) {
      res.status(200).send(provider);
    } else {
      res.status(400).send("No provider found.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProvider = async (req, res) => {
  const { uid, adminKey, url, key, panel_id, percentage, sync } = req.body;

  if (!uid || !adminKey) {
    return res.status(400).json({ error: "Missing some params" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const providers = await getDocs("providers", panel_id);
    const provider = providers.find((provider) => provider.uid === uid);

    if (provider) {
      const updatedData = {
        key: key,
        url: url,
        sync: sync,
        percentage: percentage,
      };
      await updatePanelDoc("providers", uid, updatedData, panel_id);
      res.status(200).send({ success: "Updated Successfully" });
    } else {
      res.status(400).send("Provider not found.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProvider = async (req, res) => {
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
    await deletePanelDoc("providers", uid, panel_id);
    res.status(200).send({ success: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.appProvider = async (req, res) => {
  const { adminKey, url, key, panel_id, sync, percentage } = req.body;

  if (!adminKey) {
    return res.status(400).json({ error: "Missing some params" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === adminKey);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const providerData = {
      key: key,
      url: url,
      sync: sync,
      percentage: percentage,
    };
    const response = await addPanelDoc("providers", providerData, panel_id);
    if (response) {
      res.status(200).send({ success: "Added Successfully" });
    } else {
      res.status(400).send("Failed to add provider.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrency = async (req, res) => {
  const { key, provider, panel_id, service_id } = req.body;

  if (!key) {
    return res.status(400).json({ error: "Missing some params" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === key);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  try {
    let providerUrl = "";
    if (provider) {
      providerUrl = provider;
    } else {
      const service = await getDocs("services", panel_id, {
        find: { field: "id", operator: "===", value: service_id },
      });
      providerUrl = service.provider;
    }
    const provData = await getDocs("providers", panel_id, {
      find: { field: "url", operator: "===", value: provider },
    });
    const providerData = {
      key: provData.key,
      action: "balance",
    };
    const response = await axios.post(
      `https://${providerUrl}/api/v2`,
      providerData
    );
    return res.send({
      currency: response.data.currency,
      balance: parseFloat(response.data.balance),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
