import { Pool } from "pg";
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
    sort?: {
        property: string;
        order?: "asc" | "desc";
    };
    removeKeys?: string[];
    leaveKeys?: string[];
    limit?: number;
    offset?: number;
    or?: boolean;
}
declare const getDocs: (table: string, panel_id?: number | null, query?: QueryOptions) => Promise<any>;
declare const createTableIfNotExists: (pool: Pool, col: string, data: Record<string, any>) => Promise<void>;
declare const ensureColumnsExist: (pool: Pool, table: string, records: any[]) => Promise<void>;
declare const addPanelDoc: (col: string, data: any, panel_id: number) => Promise<any>;
declare const addPanelDocs: (col: string, docs: any[], panel_id: number) => Promise<any>;
declare const deletePanelDoc: (col: string, uid: string, panel_id: number) => Promise<void>;
declare const deletePanelDocs: (col: string, uids: string[], panel_id: number) => Promise<void>;
declare const updatePanelDoc: (col: string, uid: string, newData: Record<string, any>, panel_id: number) => Promise<void>;
export { getDocs, addPanelDoc, addPanelDocs, deletePanelDoc, deletePanelDocs, updatePanelDoc, createTableIfNotExists, ensureColumnsExist, };
