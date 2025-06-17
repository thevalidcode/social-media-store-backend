const { checkKey } = require("../utils/checkapikey");
const { sendRefillToMainServer } = require("../ApiSync");
const { getDocs } = require("../crud");

exports.getRefillDocs = async (req, res) => {
  const { panel_id, key } = req.body;

  const response = checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).send({ error: "Invalid API key" });
  }

  try {
    const refills = await getDocs("refills", panel_id, {
      sort: { property: "id", order: "desc" },
      removeKeys: ["provider", "provider_id"],
    });
    return res.status(200).send(refills);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.sendRefill = async (req, res) => {
  const { panel_id, key, orderId } = req.body;

  const response = checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).send({ error: "Invalid API key" });
  }

  try {
    await sendRefillToMainServer(orderId, panel_id);
    return res.status(200).send({ success: "Sent For Refill" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getRefillAvailability = async (req, res) => {
  const { panel_id, key, serviceNames } = req.body;

  const response = checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).send({ error: "Invalid API key" });
  }

  try {
    const services = await getDocs("services", panel_id, {
      filter: {
        field: "name",
        operator: "in",
        value: serviceNames,
      },
    });
    const servicesData = services.reduce((acc, service) => {
      acc[service.name] = service.refill;
      return acc;
    }, {});
    return res
      .status(200)
      .send({ success: "Sent For Refill", data: servicesData });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
