import { v4 as uuidv4 } from "uuid";
import { vsp_pool, vp_pool } from "./db.js";

const buildWhereClause = (queryObj = {}, offset = 1) => {
  const values = [];
  const clauses = [];

  if (Array.isArray(queryObj)) {
    const subClauses = queryObj.map((cond, i) => {
      const { clause, values: subValues } = buildWhereClause(cond, offset);
      values.push(...subValues);
      offset += subValues.length;
      return `(${clause})`;
    });
    return { clause: subClauses.join(" OR "), values };
  }
  if ("field" in queryObj && "operator" in queryObj && "value" in queryObj) {
    let { field, operator, value } = queryObj;
    switch (operator) {
      case "===":
        operator = "=";
        break;
      case "!==":
        operator = "!=";
        break;
      case "in":
        operator = "IN";
        break;
      case "contains":
        operator = "ILIKE";
        value = `%${value}%`;
        break;
      case "range":
        if (!Array.isArray(value) || value.length !== 2)
          throw new Error("Range must be [min, max]");
        clauses.push(`${field} BETWEEN $${offset} AND $${offset + 1}`);
        values.push(value[0], value[1]);
        return { clause: clauses.join(" AND "), values };
    }

    if (operator === "IN" && Array.isArray(value)) {
      const placeholders = value.map((_, i) => `$${i + offset}`).join(", ");
      clauses.push(`${field} IN (${placeholders})`);
      values.push(...value);
    } else {
      clauses.push(`${field} ${operator} $${offset}`);
      values.push(value);
    }
  } else {
    Object.entries(queryObj).forEach(([key, val], idx) => {
      clauses.push(`${key} = $${offset + idx}`);
      values.push(val);
    });
  }

  const clause = clauses.join(" AND ");
  return { clause, values };
};

const getDocs = async (col, panel_id = null, query = {}) => {
  try {
    let where = "";
    let values = [];

    if (panel_id) {
      where = "WHERE panel_id = $1";
      values.push(panel_id);
    }

    if (query.find || query.filter) {
      const q = query.find || query.filter;
      const cond = buildWhereClause(q, values.length + 1);
      where = where ? `${where} AND ${cond.clause}` : `WHERE ${cond.clause}`;
      values = [...values, ...cond.values];
    }

    const pool = panel_id ? vsp_pool : vp_pool;
    const res = await pool.query(`SELECT * FROM ${col} ${where}`, values);
    let docs = res.rows;

    if (query.find) {
      if (docs.length === 1) return docs[0];
      if (docs.length > 1)
        throw new Error("Multiple documents found for 'find'");
      return null;
    }

    if (query.sort) {
      const { property, order = "asc" } = query.sort;
      docs.sort((a, b) =>
        a[property] < b[property]
          ? order === "asc"
            ? -1
            : 1
          : a[property] > b[property]
          ? order === "asc"
            ? 1
            : -1
          : 0
      );
    }

    if (query.removeKeys) {
      const keysToRemove = query.removeKeys;
      docs = docs.map((doc) => {
        keysToRemove.forEach((key) => delete doc[key]);
        return doc;
      });
    }

    if (query.leaveKeys) {
      const keysToLeave = query.leaveKeys;
      docs = docs.map((doc) => {
        const filtered = {};
        keysToLeave.forEach((key) => {
          if (key in doc) filtered[key] = doc[key];
        });
        return filtered;
      });
    }

    return docs || [];
  } catch (err) {
    return { error: err.message };
  }
};

const inferType = (val) => {
  if (val === null) return "TEXT"; // or NULLABLE
  if (typeof val === "string") return "TEXT";
  if (typeof val === "number")
    return Number.isInteger(val) ? "INTEGER" : "REAL";
  if (typeof val === "boolean") return "BOOLEAN";
  if (val instanceof Date) return "TIMESTAMP";
  if (typeof val === "object") return "JSONB";
  return "TEXT"; // fallback
};

const createTableIfNotExists = async (pool, col, data) => {
  try {
    const keys = Object.keys(data);
    if (keys.length === 0) throw new Error("Data object must not be empty");

    const columns = keys
      .map((key) => {
        const lowerKey = key.toLowerCase();
        let type;

        if (["timestamp", "created_at", "last_seen"].includes(lowerKey)) {
          type = "TIMESTAMP";
        } else {
          type = inferType(data[key]);
        }

        if (lowerKey === "id") {
          return `${key} INTEGER`;
        }
        if (
          col !== "pages" &&
          col !== "design" &&
          col !== "general" &&
          lowerKey === "uid"
        ) {
          return `${key} TEXT PRIMARY KEY`;
        }
        return `${key} ${type}`;
      })
      .join(", ");

    const sql = `CREATE TABLE IF NOT EXISTS ${col} (${columns})`;
    await pool.query(sql);
  } catch (error) {
    console.log(error.message);
  }
};

const ensureColumnsExist = async (pool, table, records) => {
  if (!Array.isArray(records) || records.length === 0) return;

  // 1. Get existing columns once
  const { rows } = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  const existing = new Set(rows.map((r) => r.column_name.toLowerCase()));

  // 2. Collect all fields across all records
  const fieldMap = new Map(); // key -> sampleValue
  for (const rec of records) {
    Object.entries(rec).forEach(([k, v]) => {
      if (!fieldMap.has(k)) fieldMap.set(k, v);
    });
  }

  // 3. Add only missing columns
  for (const [field, sample] of fieldMap) {
    if (existing.has(field.toLowerCase())) continue;

    const type = inferType(sample);
    // Quote identifiers to handle snake_case safely
    const sql = `ALTER TABLE public."${table}" ADD COLUMN "${field}" ${type}`;
    await pool.query(sql);
    existing.add(field.toLowerCase());
  }
};

const addDoc = async (col, data) => {
  try {
    if (!data.uid) data.uid = uuidv4();
    if (data.id === undefined || data.id === null) {
      let maxIdRes;

      maxIdRes = await vp_pool.query(
        `SELECT MAX(id) AS max_id FROM ${col} WHERE id IS NOT NULL`
      );

      const lastId = maxIdRes.rows[0].max_id;
      data.id = lastId !== null ? Number(lastId) + 1 : 1;
    }
    await createTableIfNotExists(vp_pool, col, data);
    await ensureColumnsExist(vp_pool, col, data);

    const keys = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === "object" && v !== null && !(v instanceof Date)
        ? JSON.stringify(v)
        : v
    );

    const params = keys.map((_, i) => `$${i + 1}`).join(", ");
    const cols = keys.join(", ");

    const result = await vp_pool.query(
      `INSERT INTO ${col} (${cols}) VALUES (${params}) RETURNING id`,
      values
    );

    return { id: result.rows[0].id, uid: data.uid };
  } catch (err) {
    console.log(err.message);
    return { error: err.message };
  }
};

const addPanelDoc = async (col, data, panel_id) => {
  data.panel_id = panel_id;
  if (!data.uid) data.uid = uuidv4();
  try {
    if (data.id === undefined || data.id === null) {
      let maxIdRes;
      maxIdRes = await vsp_pool.query(
        `SELECT MAX(id) AS max_id FROM ${col} WHERE panel_id = $1 AND id IS NOT NULL`,
        [panel_id]
      );

      const lastId = maxIdRes.rows[0].max_id;
      data.id = lastId !== null ? Number(lastId) + 1 : 1;
    }
    await createTableIfNotExists(vsp_pool, col, data);
    await ensureColumnsExist(vsp_pool, col, data);

    const keys = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === "object" && v !== null && !(v instanceof Date)
        ? JSON.stringify(v)
        : v
    );

    const params = keys.map((_, i) => `$${i + 1}`).join(", ");
    const cols = keys.join(", ");

    const result = await vsp_pool.query(
      `INSERT INTO ${col} (${cols}) VALUES (${params}) RETURNING id`,
      values
    );

    return { id: result.rows[0].id, uid: data.uid };
  } catch (err) {
    console.log(err.message);
    return { error: err.message };
  }
};

const addDocs = async (col, docs) => {
  try {
    for (const doc of docs) {
      const result = await addDoc(col, doc);
      if (result.error) return result;
    }
  } catch (err) {
    return { error: err.message };
  }
};

const addPanelDocs = async (col, docs, panel_id) => {
  try {
    for (const doc of docs) {
      const result = await addPanelDoc(col, doc, panel_id);
      if (result.error) return result;
    }
  } catch (err) {
    return { error: err.message };
  }
};

const deleteDoc = async (col, uid) => {
  try {
    await vsp_pool.query(`DELETE FROM ${col} WHERE uid = $1`, [uid]);
  } catch (err) {
    return { error: err.message };
  }
};

const deletePanelDoc = async (col, uid, panel_id) => {
  try {
    await vsp_pool.query(
      `DELETE FROM ${col} WHERE uid = $1 AND panel_id = $2`,
      [uid, panel_id]
    );
  } catch (err) {
    return { error: err.message };
  }
};

const deleteDocs = async (col, uids) => {
  try {
    await vp_pool.query(`DELETE FROM ${col} WHERE uid = ANY($1)`, [uids]);
  } catch (err) {
    return { error: err.message };
  }
};

const deletePanelDocs = async (col, uids, panel_id) => {
  try {
    await vsp_pool.query(
      `DELETE FROM ${col} WHERE uid = ANY($1) AND panel_id = $2`,
      [uids, panel_id]
    );
  } catch (err) {
    return { error: err.message };
  }
};

const updateDoc = async (col, uid, newData) => {
  try {
    const keys = Object.keys(newData);
    const values = Object.values(newData);
    const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    await vp_pool.query(
      `UPDATE ${col} SET ${sets} WHERE uid = $${keys.length + 1}`,
      [...values, uid]
    );
  } catch (err) {
    return { error: err.message };
  }
};

const updatePanelDoc = async (col, uid, newData, panel_id) => {
  try {
    const keys = Object.keys(newData);
    const values = Object.values(newData);
    const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    await vsp_pool.query(
      `UPDATE ${col} SET ${sets} WHERE uid = $${
        keys.length + 1
      } AND panel_id = $${keys.length + 2}`,
      [...values, uid, panel_id]
    );
  } catch (err) {
    return { error: err.message };
  }
};

export {
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
  createTableIfNotExists,
  ensureColumnsExist,
};
