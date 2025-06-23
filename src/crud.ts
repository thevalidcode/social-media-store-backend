import { v4 as uuidv4 } from "uuid";
import { vsp_pool, vp_pool } from "./config/db";
import { Pool } from "pg";

type QueryObject =
  | Record<string, any>
  | {
      field: string;
      operator: string;
      value: any;
    };

interface QueryOptions {
  find?: QueryObject;
  filter?: QueryObject;
  sort?: { property: string; order?: "asc" | "desc" };
  removeKeys?: string[];
  leaveKeys?: string[];
}

const buildWhereClause = (
  queryObj: QueryObject = {},
  offset = 1
): { clause: string; values: any[] } => {
  const values: any[] = [];
  const clauses: string[] = [];

  if (Array.isArray(queryObj)) {
    const subClauses = queryObj.map((cond) => {
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
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error("Range must be [min, max]");
        }
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

  return { clause: clauses.join(" AND "), values };
};

const getDocs = async (
  col: string,
  panel_id: number | null = null,
  query: QueryOptions = {}
): Promise<any> => {
  try {
    let where = "";
    let values: any[] = [];

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
      docs = docs.map((doc) => {
        query.removeKeys!.forEach((key) => delete doc[key]);
        return doc;
      });
    }

    if (query.leaveKeys) {
      docs = docs.map((doc) => {
        const filtered: Record<string, any> = {};
        query.leaveKeys!.forEach((key) => {
          if (key in doc) filtered[key] = doc[key];
        });
        return filtered;
      });
    }

    return docs || [];
  } catch (err: any) {
    return { error: err.message };
  }
};

const inferType = (val: any): string => {
  if (val === null) return "TEXT";
  if (typeof val === "string") return "TEXT";
  if (typeof val === "number")
    return Number.isInteger(val) ? "INTEGER" : "REAL";
  if (typeof val === "boolean") return "BOOLEAN";
  if (val instanceof Date) return "TIMESTAMP";
  if (typeof val === "object") return "JSONB";
  return "TEXT";
};

const createTableIfNotExists = async (
  pool: Pool,
  col: string,
  data: Record<string, any>
) => {
  const keys = Object.keys(data);
  if (!keys.length) throw new Error("Data object must not be empty");

  const columns = keys
    .map((key) => {
      const lowerKey = key.toLowerCase();
      const type = ["timestamp", "created_at", "last_seen"].includes(lowerKey)
        ? "TIMESTAMP"
        : inferType(data[key]);

      if (lowerKey === "id") return `${key} INTEGER`;
      if (!["pages", "design", "general"].includes(col) && lowerKey === "uid") {
        return `${key} TEXT PRIMARY KEY`;
      }
      return `${key} ${type}`;
    })
    .join(", ");

  const sql = `CREATE TABLE IF NOT EXISTS ${col} (${columns})`;
  await pool.query(sql);
};

const ensureColumnsExist = async (
  pool: Pool,
  table: string,
  records: any[]
) => {
  if (!records.length) return;

  const { rows } = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  const existing = new Set(rows.map((r) => r.column_name.toLowerCase()));

  const fieldMap = new Map<string, any>();
  for (const rec of records) {
    Object.entries(rec).forEach(([k, v]) => {
      if (!fieldMap.has(k)) fieldMap.set(k, v);
    });
  }

  for (const [field, sample] of fieldMap) {
    if (existing.has(field.toLowerCase())) continue;
    const type = inferType(sample);
    const sql = `ALTER TABLE public."${table}" ADD COLUMN "${field}" ${type}`;
    await pool.query(sql);
    existing.add(field.toLowerCase());
  }
};

const addDoc = async (col: string, data: any) => {
  try {
    if (!data.uid) data.uid = uuidv4();

    if (data.id === undefined || data.id === null) {
      const { rows } = await vp_pool.query(
        `SELECT MAX(id) AS max_id FROM ${col} WHERE id IS NOT NULL`
      );
      data.id = rows[0].max_id !== null ? Number(rows[0].max_id) + 1 : 1;
    }

    await createTableIfNotExists(vp_pool, col, data);
    await ensureColumnsExist(vp_pool, col, [data]);

    const keys = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === "object" && v !== null && !(v instanceof Date)
        ? JSON.stringify(v)
        : v
    );
    const params = keys.map((_, i) => `$${i + 1}`).join(", ");

    const result = await vp_pool.query(
      `INSERT INTO ${col} (${keys.join(", ")}) VALUES (${params}) RETURNING *`,
      values
    );
    return { ...result.rows[0], uid: data.uid };
  } catch (err: any) {
    return { error: err.message };
  }
};

const addPanelDoc = async (col: string, data: any, panel_id: number) => {
  data.panel_id = panel_id;
  if (!data.uid) data.uid = uuidv4();
  try {
    if (data.id === undefined || data.id === null) {
      const { rows } = await vsp_pool.query(
        `SELECT MAX(id) AS max_id FROM ${col} WHERE panel_id = $1 AND id IS NOT NULL`,
        [panel_id]
      );
      data.id = rows[0].max_id !== null ? Number(rows[0].max_id) + 1 : 1;
    }

    await createTableIfNotExists(vsp_pool, col, data);
    await ensureColumnsExist(vsp_pool, col, [data]);

    const keys = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === "object" && v !== null && !(v instanceof Date)
        ? JSON.stringify(v)
        : v
    );
    const params = keys.map((_, i) => `$${i + 1}`).join(", ");

    const result = await vsp_pool.query(
      `INSERT INTO ${col} (${keys.join(", ")}) VALUES (${params}) RETURNING *`,
      values
    );
    return { ...result.rows[0], uid: data.uid };
  } catch (err: any) {
    return { error: err.message };
  }
};

const addDocs = async (col: string, docs: any[]) => {
  for (const doc of docs) {
    const result = await addDoc(col, doc);
    if (result.error) return result;
  }
};

const addPanelDocs = async (col: string, docs: any[], panel_id: number) => {
  for (const doc of docs) {
    const result = await addPanelDoc(col, doc, panel_id);
    if (result.error) return result;
  }
};

const deleteDoc = async (col: string, uid: string) => {
  await vsp_pool.query(`DELETE FROM ${col} WHERE uid = $1`, [uid]);
};

const deletePanelDoc = async (col: string, uid: string, panel_id: number) => {
  await vsp_pool.query(`DELETE FROM ${col} WHERE uid = $1 AND panel_id = $2`, [
    uid,
    panel_id,
  ]);
};

const deleteDocs = async (col: string, uids: string[]) => {
  await vp_pool.query(`DELETE FROM ${col} WHERE uid = ANY($1)`, [uids]);
};

const deletePanelDocs = async (
  col: string,
  uids: string[],
  panel_id: number
) => {
  await vsp_pool.query(
    `DELETE FROM ${col} WHERE uid = ANY($1) AND panel_id = $2`,
    [uids, panel_id]
  );
};

const updateDoc = async (
  col: string,
  uid: string,
  newData: Record<string, any>
) => {
  const keys = Object.keys(newData);
  const values = Object.values(newData);
  const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  await vp_pool.query(
    `UPDATE ${col} SET ${sets} WHERE uid = $${keys.length + 1}`,
    [...values, uid]
  );
};

const updatePanelDoc = async (
  col: string,
  uid: string,
  newData: Record<string, any>,
  panel_id: number
) => {
  const keys = Object.keys(newData);
  const values = Object.values(newData);
  const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  await vsp_pool.query(
    `UPDATE ${col} SET ${sets} WHERE uid = $${
      keys.length + 1
    } AND panel_id = $${keys.length + 2}`,
    [...values, uid, panel_id]
  );
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
