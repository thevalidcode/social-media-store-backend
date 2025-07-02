import { v4 as uuidv4 } from "uuid";
import { Pool } from "pg";
import { pool } from "./config/db";

type Operator = "===" | "!==" | "in" | "contains" | "range";

type Condition = {
  field: string;
  operator: Operator;
  value: any;
};

type RawObject = Record<string, any>;

export type QueryObject = Condition | Condition[] | RawObject;

interface QueryOptions {
  find?: QueryObject;
  filter?: QueryObject;
  sort?: { property: string; order?: "asc" | "desc" };
  removeKeys?: string[];
  leaveKeys?: string[];
  limit?: number;
  offset?: number;
  or?: boolean; // new: enable OR logic when using array of conditions
}

const buildWhereClause = (
  input: QueryObject,
  startIndex: number,
  useOr = false
): { clause: string; values: any[] } => {
  const clauses: string[] = [];
  const values: any[] = [];

  if (Array.isArray(input)) {
    input.forEach((condition) => {
      const offset = startIndex + values.length;
      const { clause, values: subVals } = buildWhereClause(condition, offset);
      clauses.push(`(${clause})`);
      values.push(...subVals);
    });
    return { clause: clauses.join(useOr ? " OR " : " AND "), values };
  }

  if ("field" in input && "operator" in input && "value" in input) {
    const { field } = input;
    let { operator, value } = input;

    switch (operator) {
      case "===":
        clauses.push(`${field} = $${startIndex}`);
        values.push(value);
        break;
      case "!==":
        clauses.push(`${field} != $${startIndex}`);
        values.push(value);
        break;
      case "in":
        if (!Array.isArray(value))
          throw new Error("Value for 'in' must be an array");
        const placeholders = value
          .map((_, i) => `$${startIndex + i}`)
          .join(", ");
        clauses.push(`${field} IN (${placeholders})`);
        values.push(...value);
        break;
      case "contains":
        clauses.push(`${field} ILIKE $${startIndex}`);
        values.push(`%${value}%`);
        break;
      case "range":
        if (!Array.isArray(value) || value.length !== 2)
          throw new Error("Range must be [min, max]");
        clauses.push(`${field} BETWEEN $${startIndex} AND $${startIndex + 1}`);
        values.push(value[0], value[1]);
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    return { clause: clauses.join(" AND "), values };
  }

  // Fallback: raw object
  Object.entries(input).forEach(([key, val], i) => {
    clauses.push(`${key} = $${startIndex + i}`);
    values.push(val);
  });

  return { clause: clauses.join(" AND "), values };
};

const getDocs = async (
  table: string,
  panel_id: number | null = null,
  query: QueryOptions = {}
): Promise<any> => {
  try {
    let where = "";
    let values: any[] = [];

    if (panel_id !== null) {
      where = `WHERE panel_id = $1`;
      values.push(panel_id);
    }

    const filterInput = query.find || query.filter;
    if (filterInput) {
      const { clause, values: filterVals } = buildWhereClause(
        filterInput,
        values.length + 1,
        query.or ?? false
      );
      where = where ? `${where} AND ${clause}` : `WHERE ${clause}`;
      values.push(...filterVals);
    }

    let sql = `SELECT * FROM ${table} ${where}`;

    // Add LIMIT and OFFSET
    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }
    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }

    const result = await pool.query(sql, values);
    let docs = result.rows;

    // Handle find return type
    if (query.find && !Array.isArray(query.find)) {
      if (docs.length === 1) return docs[0];
      if (docs.length > 1)
        throw new Error("Multiple documents found for 'find'");
      return null;
    }

    // Sorting (client-side)
    if (query.sort) {
      const { property, order = "asc" } = query.sort;
      docs = docs.sort((a, b) =>
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

    // removeKeys
    if (query.removeKeys) {
      docs = docs.map((doc) => {
        query.removeKeys!.forEach((key) => delete doc[key]);
        return doc;
      });
    }

    // leaveKeys
    if (query.leaveKeys) {
      docs = docs.map((doc) => {
        const cleaned: Record<string, any> = {};
        query.leaveKeys!.forEach((key) => {
          if (key in doc) cleaned[key] = doc[key];
        });
        return cleaned;
      });
    }

    return docs;
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

const addPanelDoc = async (col: string, data: any, panel_id: number) => {
  data.panel_id = panel_id;
  if (!data.uid) data.uid = uuidv4();
  try {
    if (data.id === undefined || data.id === null) {
      const { rows } = await pool.query(
        `SELECT MAX(id) AS max_id FROM ${col} WHERE panel_id = $1 AND id IS NOT NULL`,
        [panel_id]
      );
      data.id = rows[0].max_id !== null ? Number(rows[0].max_id) + 1 : 1;
    }

    await createTableIfNotExists(pool, col, data);
    await ensureColumnsExist(pool, col, [data]);

    const keys = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === "object" && v !== null && !(v instanceof Date)
        ? JSON.stringify(v)
        : v
    );
    const params = keys.map((_, i) => `$${i + 1}`).join(", ");

    const result = await pool.query(
      `INSERT INTO ${col} (${keys.join(", ")}) VALUES (${params}) RETURNING *`,
      values
    );
    return { ...result.rows[0], uid: data.uid };
  } catch (err: any) {
    return { error: err.message };
  }
};

const addPanelDocs = async (col: string, docs: any[], panel_id: number) => {
  for (const doc of docs) {
    const result = await addPanelDoc(col, doc, panel_id);
    if (result.error) return result;
  }
};

const deletePanelDoc = async (col: string, uid: string, panel_id: number) => {
  await pool.query(`DELETE FROM ${col} WHERE uid = $1 AND panel_id = $2`, [
    uid,
    panel_id,
  ]);
};

const deletePanelDocs = async (
  col: string,
  uids: string[],
  panel_id: number
) => {
  await pool.query(`DELETE FROM ${col} WHERE uid = ANY($1) AND panel_id = $2`, [
    uids,
    panel_id,
  ]);
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
  await pool.query(
    `UPDATE ${col} SET ${sets} WHERE uid = $${
      keys.length + 1
    } AND panel_id = $${keys.length + 2}`,
    [...values, uid, panel_id]
  );
};

export {
  getDocs,
  addPanelDoc,
  addPanelDocs,
  deletePanelDoc,
  deletePanelDocs,
  updatePanelDoc,
  createTableIfNotExists,
  ensureColumnsExist,
};
