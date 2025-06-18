import express from 'express';const nextIdRouter = express.Router();
import {  getDocs  } from '../crud.js';

nextIdRouter.post("/", async (req, res) => {
  const { collection, panel_id } = req.body;

  if (!collection || !panel_id) {
    return res.status(400).json({ error: "Missing collection or panel_id" });
  }

  const data = await getDocs(collection, panel_id);
  if (data.length === 0) {
    return res.status(200).send({ id: 1 });
  }
  const filteredData = data.filter((doc) => doc.id);
  const sortedData = filteredData.sort((a, b) => b.id - a.id);
  const firstData = sortedData.slice(0, 1);
  const docId = firstData[0].id;
  const newID = docId + 1;
  return res.status(200).send({ id: newID });
});

const idIncrement = async (collection, panel_id) => {
  const data = await getDocs(collection, panel_id);
  if (data.length === 0) {
    return { id: 1 };
  }
  const filteredData = data.filter((doc) => doc.id);
  const sortedData = filteredData.sort((a, b) => b.id - a.id);
  const firstData = sortedData.slice(0, 1);
  const docId = firstData[0].id;
  const newID = docId + 1;
  return { id: newID };
};

export {  nextIdRouter, idIncrement  };
