const fs = require("fs").promises;
const path = require("path");
const { updatePanelDoc } = require("../crud");
const { checkKey } = require("../utils/checkapikey");

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  const { panel_id, domain, useage, key } = req.body;
  const response = checkKey(key, panel_id);
  if (response.error) {
    return res.status(401).send({ error: response.error });
  }

  try {
    const originalFilePath = req.file.path;
    const filePath = path.join(
      path.dirname(originalFilePath),
      `${panel_id}/${useage}`
    );

    await fs.mkdir(filePath, { recursive: true });
    await fs.rename(originalFilePath, path.join(filePath, req.file.filename));

    return res.status(200).send({
      url: `https://${domain}/assets/${panel_id}/${useage}/${req.file.filename}`,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.uploadFavicon = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const { panel_id, domain } = req.body;
  const newSiteFile = `${panel_id}/site/favicon.png`;

  const originalFilePath = req.file.path;
  const sitePath = path.join(
    path.dirname(originalFilePath),
    `${panel_id}/site`
  );
  const newFilePath = path.join(path.dirname(originalFilePath), newSiteFile);

  try {
    await fs.mkdir(sitePath, { recursive: true });
    await fs.rename(originalFilePath, newFilePath);

    await updatePanelDoc(
      "general",
      "site",
      {
        favicon_url: `https://${domain}/assets/${newSiteFile}`,
      },
      panel_id
    );

    return res.status(200).send("File upload and rename successful");
  } catch (error) {
    console.error("Error uploading favicon:", error);
    return res.status(500).send("Error processing file upload");
  }
};

exports.uploadLogo = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const { panel_id, domain } = req.body;
  const directoryPath = path.join("/home/panels/assets", `${panel_id}/site`);
  const possibleExtensions = [".png", ".jpg", ".jpeg"];

  try {
    // Delete existing logo file if any
    for (const ext of possibleExtensions) {
      const existingFilePath = path.join(directoryPath, `logo${ext}`);
      try {
        await fs.access(existingFilePath);
        await fs.unlink(existingFilePath);
        break; // Found and deleted existing logo, break the loop
      } catch {
        // File doesn't exist, continue
      }
    }

    const originalFilePath = req.file.path;
    const fileExt = path.extname(originalFilePath);
    const newFilename = `logo${fileExt}`;
    const newFilePath = path.join(directoryPath, newFilename);

    await fs.mkdir(directoryPath, { recursive: true });
    await fs.rename(originalFilePath, newFilePath);

    await updatePanelDoc(
      "general",
      "site",
      {
        logo_url: `https://${domain}/assets/${panel_id}/site/${newFilename}`,
      },
      panel_id
    );

    return res.status(200).send("File upload and rename successful");
  } catch (error) {
    console.error("Error uploading logo:", error);
    return res.status(500).send("Error processing file upload");
  }
};
