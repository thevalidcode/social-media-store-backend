import { getDocs, addPanelDoc, updatePanelDoc } from "../crud.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { checkAdminApiKey, checkKey } from "../utils/checkapikey.js";

export const getServices = async (req, res) => {
  const { panel_id, key } = req.query;

  if (!panel_id) {
    return res.status(400).json({ error: "Mising panel_id" });
  }

  const adminExist = await checkAdminApiKey(key, panel_id);
  if (adminExist.error) {
    return res.status(401).json({ error: "Invalid Key" });
  }
  try {
    const services = await getDocs("services", panel_id, {
      filter: { field: "status", operator: "==", value: "active" },
      removeKeys: adminExist
        ? []
        : [
            "sync_quantity",
            "sync_cat_and_name",
            "provider",
            "percentage",
            "status",
            "panel_id",
            "provider_id",
            "uid",
            "provider_price",
          ],
    });

    const sortedServices = services.sort((a, b) => a.position - b.position);
    return res.status(200).json(sortedServices);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const importServices = async (req, res) => {
  const { providerServicesId, importPercent, categoryOption, providerOption } =
    req.body;
  const { role, panel_id } = req.auth;

  if (
    !providerServicesId ||
    !importPercent ||
    !categoryOption ||
    !providerOption
  ) {
    return res.status(400).json({ error: "Missing values" });
  }

  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  try {
    const services = await getDocs("services", panel_id);
    let maxId = services.reduce((max, svc) => Math.max(max, svc.id), 0);

    const categories = await getDocs("categories", panel_id);
    let categoryId = categories.length;

    const provcResponse = await axios.post(
      `https://${providerOption.value}/api/v2`,
      { action: "balance", key: providerOption.key }
    );

    const provider_currency = provcResponse.data.currency.toUpperCase();

    const providerResponse = await axios.post(
      `https://${providerOption.value}/api/v2`,
      { action: "services", key: providerOption.key }
    );
    const providerServices = providerResponse.data;

    for (const selId of providerServicesId) {
      maxId++;
      categoryId++;

      const service = providerServices.find(
        (serv) => parseInt(serv.service) === parseInt(selId)
      );
      if (!service) continue;

      const calculatePrice =
        parseFloat(service.rate) +
        (parseFloat(service.rate) * importPercent) / 100;
      const endPrice = parseFloat(calculatePrice).toFixed(3);

      if (categoryOption.value === "createSameCategory") {
        const currentCategories = await getDocs("categories", panel_id);
        const existingCategory = currentCategories.find(
          (cat) => cat.name === service.category
        );

        if (!existingCategory) {
          const categoryData = {
            id: categoryId,
            name: service.category,
            timestamp: new Date(),
            status: "active",
            position: categoryId,
            uid: uuidv4(),
          };
          await addPanelDoc("categories", categoryData, panel_id);
        }
      }

      const existingService = services.find(
        (svc) => svc.provider_id === parseInt(service.service)
      );

      if (!existingService) {
        const serviceData = {
          id: maxId,
          name: service.name,
          category:
            categoryOption.value === "createSameCategory"
              ? service.category
              : categoryOption.label,
          type: service.type,
          min: parseInt(service.min),
          max: parseInt(service.max),
          provider_id: parseInt(service.service),
          description: service.description || "",
          provider_price: parseFloat(service.rate),
          panel_id,
          timestamp: new Date(),
          status: "active",
          sync_quantity: true,
          sync_cat_and_name: true,
          price: parseFloat(endPrice),
          position: maxId,
          cancel: service.cancel,
          network: service.network || "None",
          refill: service.refill,
          percentage: importPercent,
          drip_feed: false,
          provider: providerOption.label,
          provider_currency,
          uid: uuidv4(),
        };
        await addPanelDoc("services", serviceData, panel_id);
      }
    }

    return res.status(200).send("Services imported successfully");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateService = async (req, res) => {
  const {
    panel_id,
    serviceUid,
    refill_days,
    serviceName,
    serviceMin,
    serviceMax,
    serviceDescription,
    pricePercent,
    actualPrice,
    categoryOption,
    serviceType,
    sync_quantity,
    drip_feed,
    cancel,
    sync_cat_and_name,
    refill,
    key,
    status,
    oldServiceName,
  } = req.body;

  const allAdmins = await getDocs("admins", panel_id);
  if (!allAdmins.some((admin) => admin.api_key === key)) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const updateFields = {
      refill_days: refill_days || 0,
      name: serviceName,
      status,
      min: serviceMin,
      max: serviceMax,
      drip_feed,
      sync_quantity,
      refill,
      cancel,
      description: serviceDescription,
      sync_cat_and_name,
      percentage: pricePercent,
      price: actualPrice,
      category: categoryOption.value || categoryOption,
      type: serviceType.value || serviceType,
    };

    await updatePanelDoc("services", serviceUid, updateFields, panel_id);

    if (oldServiceName && oldServiceName !== serviceName) {
      const orders = await getDocs("orders", panel_id);
      for (const order of orders) {
        if (order.service === oldServiceName) {
          await updatePanelDoc(
            "orders",
            order.uid,
            { service: serviceName },
            panel_id
          );
        }
      }
    }

    return res.status(200).send("Updated Successfully");
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const updatePosition = async (req, res) => {
  const { data, panel_id, key } = req.body;

  const adminExist = await checkAdminApiKey(key, panel_id);
  if (adminExist.error) {
    return res.status(401).json({ error: "Invalid Key" });
  }

  try {
    for (const serv of data) {
      await updatePanelDoc(
        "services",
        serv.uid,
        { position: serv.position },
        panel_id
      );
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update positions" });
  }
};

export const updateCategory = async (req, res) => {
  const {
    categoryUid,
    categoryName,
    panel_id,
    initialName,
    key,
    categoryStatus,
  } = req.body;

  const allAdmins = await getDocs("admins", panel_id);
  if (!allAdmins.some((admin) => admin.api_key === key)) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const updateFields = {
      name: categoryName,
      status: categoryStatus ? "active" : "disabled",
    };

    await updatePanelDoc("categories", categoryUid, updateFields, panel_id);

    if (initialName && initialName !== categoryName) {
      const services = await getDocs("services", panel_id);
      for (const service of services) {
        if (service.category === initialName) {
          await updatePanelDoc(
            "services",
            service.uid,
            { category: categoryName },
            panel_id
          );
        }
      }

      const orders = await getDocs("orders", panel_id);
      for (const order of orders) {
        if (order.category === initialName) {
          await updatePanelDoc(
            "orders",
            order.uid,
            { category: categoryName },
            panel_id
          );
        }
      }
    }

    return res.status(200).send("Updated Successfully");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCatPosition = async (req, res) => {
  const { data, panel_id, key } = req.body;

  const adminExist = await checkAdminApiKey(key, panel_id);
  if (adminExist.error) {
    return res.status(401).json({ error: "Invalid Key" });
  }

  try {
    for (const cat of data) {
      await updatePanelDoc(
        "categories",
        cat.uid,
        { position: cat.position },
        panel_id
      );
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to update category positions" });
  }
};

export const getServiceByID = async (req, res) => {
  const { panel_id, key, service_id } = req.body;

  const response = await checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    const service = await getDocs("services", panel_id, {
      find: { field: "id", operator: "===", value: service_id },
      removeKeys: [
        "provider_id",
        "provider_price",
        "percentage",
        "provider",
        "sync_cat_and_name",
        "sync_quantity",
        "panel_id",
        "status",
        "position",
      ],
    });
    return res.status(200).json({ service });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addCategory = async (req, res) => {
  const { panel_id, key } = req.body;

  const response = await checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  try {
    delete req.body.key;
    delete req.body.panel_id;
    const result = await addPanelDoc("categories", { ...req.body }, panel_id);
    await updatePanelDoc(
      "categories",
      result.uid,
      { position: result.id },
      panel_id
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
