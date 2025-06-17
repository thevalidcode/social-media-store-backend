const { getDocs, updateDoc, addDoc } = require("../crud");
const { getCurrentRates } = require("../ApiSync");

exports.getRates = async (req, res) => {
  const { key, panel_id } = req.body;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === key);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const data = await getCurrentRates();
    res.status(200).send(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRatesToDatabase = async (req, res) => {
  const { key, panel_id } = req.body;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === key);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const data = await getCurrentRates();
    const existingRates = await getDocs("exchange_rates", "latest");
    
    if (existingRates) {
      await updateDoc("exchange_rates", "latest", data);
    } else {
      await addDoc("exchange_rates", { uid: "latest", ...data });
    }

    console.log("Exchange rates saved to JSON database.");
    res.status(200).send({ success: "Updated Successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
