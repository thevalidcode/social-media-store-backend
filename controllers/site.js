const ogs = require("open-graph-scraper");

exports.getMetaData = async (req, res) => {
  const url = `https://${req.body.url}`;
  try {
    const { error, result } = await ogs({ url });
    if (error) {
      return res.status(500).send("Failed to fetch metadata");
    }
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};
