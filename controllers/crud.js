const {
  getDocs,
  addDoc,
  addPanelDoc,
  addDocs,
  addPanelDocs,
  deleteDoc,
  deletePanelDoc,
  deleteDocs,
  deletePanelDocs,
  updateDoc,
  updatePanelDoc,
} = require("../crud");
const { checkKey } = require("../utils/checkapikey");

const isPublicCollection = (collection) =>
  ["exchange_rates", "blogs", "categories", "faqs"].includes(collection);

const validateAuthorization = (key, panel_id, collection) => {
  if (!isPublicCollection(collection) && checkKey(key, panel_id).error) {
    return { error: "Unauthorized User" };
  }
  return {};
};

exports.getData = async (req, res) => {
  const { panel_id, collection, query = {}, key } = req.body;
  const authError = validateAuthorization(key, panel_id, collection);
  if (authError.error) {
    return res.status(401).json(authError);
  }

  try {
    let data;
    if (panel_id) {
      // Hide sensitive keys from responses
      const removeKeys =
        collection === "users" || collection === "admins"
          ? [...(query.removeKeys || []), "password"]
          : collection === "payment_gateways"
          ? [...(query.removeKeys || []), "secret_key"]
          : query.removeKeys || [];

      data = await getDocs(collection, panel_id, { ...query, removeKeys });
    } else {
      data = await getDocs(collection, query);
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addData = async (req, res) => {
  const { panel_id, collection, data, key } = req.body;
  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Unauthorized User" });
  }
  try {
    const response = panel_id
      ? await addPanelDoc(collection, data, panel_id)
      : await addDoc(collection, data);
    return res.status(201).json(response);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteData = async (req, res) => {
  const { panel_id, collection, uid, key } = req.body;
  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Unauthorized User" });
  }
  try {
    if (!uid) {
      return res.status(400).json({ error: "Missing UID" });
    }
    if (panel_id) {
      await await deletePanelDoc(collection, uid, panel_id);
    } else {
      await deleteDoc(collection, uid);
    }
    return res.status(200).json({ success: "Deleted Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateData = async (req, res) => {
  const { panel_id, collection, uid, data, key } = req.body;
  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Unauthorized User" });
  }
  if (!uid || !data) {
    return res.status(400).json({ error: "Missing UID or data" });
  }
  try {
    if (panel_id) {
      await updatePanelDoc(collection, uid, data, panel_id);
    } else {
      await updateDoc(collection, uid, data);
    }
    return res.status(200).json({ success: "Updated Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addMultipleDocs = async (req, res) => {
  const { panel_id, collection, data, key } = req.body;
  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Unauthorized User" });
  }
  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "Data must be a non-empty array" });
  }
  try {
    const response = panel_id
      ? await addPanelDocs(collection, data, panel_id)
      : await addDocs(collection, data);
    return res.status(201).json(response);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteMultipleDocs = async (req, res) => {
  const { panel_id, collection, uids, key } = req.body;
  if (checkKey(key, panel_id).error) {
    return res.status(401).json({ error: "Unauthorized User" });
  }
  if (!Array.isArray(uids) || uids.length === 0) {
    return res.status(400).json({ error: "UIDs must be a non-empty array" });
  }
  try {
    const response = panel_id
      ? await deletePanelDocs(collection, uids, panel_id)
      : await deleteDocs(collection, uids);
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
