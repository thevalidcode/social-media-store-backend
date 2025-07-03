"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureColumnsExist = exports.createTableIfNotExists = exports.updatePanelDoc = exports.deletePanelDocs = exports.deletePanelDoc = exports.addPanelDocs = exports.addPanelDoc = exports.getDocs = exports.columnExists = void 0;
const uuid_1 = require("uuid");
const db_1 = require("./config/db");
const buildWhereClause = (input, startIndex, useOr = false) => {
    const clauses = [];
    const values = [];
    if (Array.isArray(input)) {
        input.forEach((condition, idx) => {
            const { clause, values: subVals } = buildWhereClause(condition, startIndex + values.length, false);
            clauses.push(`(${clause})`);
            values.push(...subVals);
        });
        return { clause: clauses.join(useOr ? " OR " : " AND "), values };
    }
    // Handle structured conditions
    if ("field" in input && "operator" in input && "value" in input) {
        const { field, operator, value } = input;
        switch (operator) {
            case "===":
            case "$eq":
                clauses.push(`${field} = $${startIndex}`);
                values.push(value);
                break;
            case "!==":
            case "$ne":
                clauses.push(`${field} != $${startIndex}`);
                values.push(value);
                break;
            case "in":
            case "$in":
                if (!Array.isArray(value))
                    throw new Error("Value for 'in' must be an array");
                const placeholdersIn = value
                    .map((_, i) => `$${startIndex + i}`)
                    .join(", ");
                clauses.push(`${field} IN (${placeholdersIn})`);
                values.push(...value);
                break;
            case "$nin":
                if (!Array.isArray(value))
                    throw new Error("Value for '$nin' must be an array");
                const placeholdersNotIn = value
                    .map((_, i) => `$${startIndex + i}`)
                    .join(", ");
                clauses.push(`${field} NOT IN (${placeholdersNotIn})`);
                values.push(...value);
                break;
            case "contains":
            case "$regex":
                clauses.push(`${field} ILIKE $${startIndex}`);
                values.push(`%${value}%`);
                break;
            case "range":
            case "$range":
                if (!Array.isArray(value) || value.length !== 2) {
                    throw new Error("Range must be [min, max]");
                }
                clauses.push(`${field} BETWEEN $${startIndex} AND $${startIndex + 1}`);
                values.push(value[0], value[1]);
                break;
            case "$lt":
                clauses.push(`${field} < $${startIndex}`);
                values.push(value);
                break;
            case "$lte":
                clauses.push(`${field} <= $${startIndex}`);
                values.push(value);
                break;
            case "$gt":
                clauses.push(`${field} > $${startIndex}`);
                values.push(value);
                break;
            case "$gte":
                clauses.push(`${field} >= $${startIndex}`);
                values.push(value);
                break;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
        return { clause: clauses.join(" AND "), values };
    }
    // Handle raw object style
    Object.entries(input).forEach(([field, val]) => {
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
            Object.entries(val).forEach(([op, v]) => {
                const idx = startIndex + values.length;
                switch (op) {
                    case "$eq":
                        clauses.push(`${field} = $${idx}`);
                        values.push(v);
                        break;
                    case "$ne":
                        clauses.push(`${field} != $${idx}`);
                        values.push(v);
                        break;
                    case "$lt":
                        clauses.push(`${field} < $${idx}`);
                        values.push(v);
                        break;
                    case "$lte":
                        clauses.push(`${field} <= $${idx}`);
                        values.push(v);
                        break;
                    case "$gt":
                        clauses.push(`${field} > $${idx}`);
                        values.push(v);
                        break;
                    case "$gte":
                        clauses.push(`${field} >= $${idx}`);
                        values.push(v);
                        break;
                    case "$in":
                        if (!Array.isArray(v))
                            throw new Error(`$in must be an array`);
                        const inPlaceholders = v.map((_, i) => `$${idx + i}`).join(", ");
                        clauses.push(`${field} IN (${inPlaceholders})`);
                        values.push(...v);
                        break;
                    case "$nin":
                        if (!Array.isArray(v))
                            throw new Error(`$nin must be an array`);
                        const notInPlaceholders = v.map((_, i) => `$${idx + i}`).join(", ");
                        clauses.push(`${field} NOT IN (${notInPlaceholders})`);
                        values.push(...v);
                        break;
                    case "$regex":
                        clauses.push(`${field} ILIKE $${idx}`);
                        values.push(`%${v}%`);
                        break;
                    case "$range":
                        if (!Array.isArray(v) || v.length !== 2)
                            throw new Error("Range must be [min, max]");
                        clauses.push(`${field} BETWEEN $${idx} AND $${idx + 1}`);
                        values.push(v[0], v[1]);
                        break;
                    default:
                        throw new Error(`Unsupported operator in raw object: ${op}`);
                }
            });
        }
        else {
            const idx = startIndex + values.length;
            clauses.push(`${field} = $${idx}`);
            values.push(val);
        }
    });
    return { clause: clauses.join(" AND "), values };
};
const getDocs = async (table, panel_id = null, query = {}) => {
    try {
        let where = "";
        let values = [];
        if (panel_id !== null) {
            where = `WHERE panel_id = $1`;
            values.push(panel_id);
        }
        const filterInput = query.find || query.filter;
        if (filterInput) {
            const { clause, values: filterVals } = buildWhereClause(filterInput, values.length + 1, query.or ?? false);
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
        const result = await db_1.pool.query(sql, values);
        let docs = result.rows;
        // Handle find return type
        if (query.find && !Array.isArray(query.find)) {
            if (docs.length === 1)
                return docs[0];
            if (docs.length > 1)
                throw new Error("Multiple documents found for 'find'");
            return null;
        }
        // Sorting (client-side)
        if (query.sort) {
            const { property, order = "asc" } = query.sort;
            docs = docs.sort((a, b) => a[property] < b[property]
                ? order === "asc"
                    ? -1
                    : 1
                : a[property] > b[property]
                    ? order === "asc"
                        ? 1
                        : -1
                    : 0);
        }
        // removeKeys
        if (query.removeKeys) {
            docs = docs.map((doc) => {
                query.removeKeys.forEach((key) => delete doc[key]);
                return doc;
            });
        }
        // leaveKeys
        if (query.leaveKeys) {
            docs = docs.map((doc) => {
                const cleaned = {};
                query.leaveKeys.forEach((key) => {
                    if (key in doc)
                        cleaned[key] = doc[key];
                });
                return cleaned;
            });
        }
        return docs;
    }
    catch (err) {
        return { error: err.message };
    }
};
exports.getDocs = getDocs;
const inferType = (val) => {
    if (val === null)
        return "TEXT";
    if (typeof val === "string")
        return "TEXT";
    if (typeof val === "number")
        return Number.isInteger(val) ? "INTEGER" : "REAL";
    if (typeof val === "boolean")
        return "BOOLEAN";
    if (val instanceof Date)
        return "TIMESTAMP";
    if (typeof val === "object")
        return "JSONB";
    return "TEXT";
};
const createTableIfNotExists = async (pool, col, data) => {
    const keys = Object.keys(data);
    if (!keys.length)
        throw new Error("Data object must not be empty");
    const columns = keys
        .map((key) => {
        const lowerKey = key.toLowerCase();
        const type = ["timestamp", "created_at", "last_seen"].includes(lowerKey)
            ? "TIMESTAMP"
            : inferType(data[key]);
        if (lowerKey === "id")
            return `${key} INTEGER`;
        if (!["pages", "design", "general"].includes(col) && lowerKey === "uid") {
            return `${key} TEXT PRIMARY KEY`;
        }
        return `${key} ${type}`;
    })
        .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS ${col} (${columns})`;
    await pool.query(sql);
};
exports.createTableIfNotExists = createTableIfNotExists;
const columnExists = async (table, column) => {
    if (typeof table !== "string" || typeof column !== "string")
        return false;
    if (!table.trim() || !column.trim())
        return false;
    const query = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
  `;
    const res = await db_1.pool.query(query, [table, column]);
    return (res.rowCount ?? 0) > 0;
};
exports.columnExists = columnExists;
const ensureColumnsExist = async (pool, table, records) => {
    if (!records.length)
        return;
    const { rows } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`, [table]);
    const existing = new Set(rows.map((r) => r.column_name.toLowerCase()));
    const fieldMap = new Map();
    for (const rec of records) {
        Object.entries(rec).forEach(([k, v]) => {
            if (!fieldMap.has(k))
                fieldMap.set(k, v);
        });
    }
    for (const [field, sample] of fieldMap) {
        if (existing.has(field.toLowerCase()))
            continue;
        const type = inferType(sample);
        const sql = `ALTER TABLE public."${table}" ADD COLUMN "${field}" ${type}`;
        await pool.query(sql);
        existing.add(field.toLowerCase());
    }
};
exports.ensureColumnsExist = ensureColumnsExist;
const addPanelDoc = async (col, data, panel_id) => {
    data.panel_id = panel_id;
    if (!data.uid)
        data.uid = (0, uuid_1.v4)();
    try {
        if (data.id === undefined || data.id === null) {
            const { rows } = await db_1.pool.query(`SELECT MAX(id) AS max_id FROM ${col} WHERE panel_id = $1 AND id IS NOT NULL`, [panel_id]);
            data.id = rows[0].max_id !== null ? Number(rows[0].max_id) + 1 : 1;
        }
        await createTableIfNotExists(db_1.pool, col, data);
        await ensureColumnsExist(db_1.pool, col, [data]);
        const keys = Object.keys(data);
        const values = Object.values(data).map((v) => typeof v === "object" && v !== null && !(v instanceof Date)
            ? JSON.stringify(v)
            : v);
        const params = keys.map((_, i) => `$${i + 1}`).join(", ");
        const result = await db_1.pool.query(`INSERT INTO ${col} (${keys.join(", ")}) VALUES (${params}) RETURNING *`, values);
        return { ...result.rows[0], uid: data.uid };
    }
    catch (err) {
        return { error: err.message };
    }
};
exports.addPanelDoc = addPanelDoc;
const addPanelDocs = async (col, docs, panel_id) => {
    for (const doc of docs) {
        const result = await addPanelDoc(col, doc, panel_id);
        if (result.error)
            return result;
    }
};
exports.addPanelDocs = addPanelDocs;
const deletePanelDoc = async (col, uid, panel_id) => {
    await db_1.pool.query(`DELETE FROM ${col} WHERE uid = $1 AND panel_id = $2`, [
        uid,
        panel_id,
    ]);
};
exports.deletePanelDoc = deletePanelDoc;
const deletePanelDocs = async (col, uids, panel_id) => {
    await db_1.pool.query(`DELETE FROM ${col} WHERE uid = ANY($1) AND panel_id = $2`, [
        uids,
        panel_id,
    ]);
};
exports.deletePanelDocs = deletePanelDocs;
const updatePanelDoc = async (col, uid, newData, panel_id) => {
    const keys = Object.keys(newData);
    const values = Object.values(newData);
    const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    await db_1.pool.query(`UPDATE ${col} SET ${sets} WHERE uid = $${keys.length + 1} AND panel_id = $${keys.length + 2}`, [...values, uid, panel_id]);
};
exports.updatePanelDoc = updatePanelDoc;
