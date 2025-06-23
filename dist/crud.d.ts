import { Pool } from "pg";
type QueryObject = Record<string, any> | {
    field: string;
    operator: string;
    value: any;
};
interface QueryOptions {
    find?: QueryObject;
    filter?: QueryObject;
    sort?: {
        property: string;
        order?: "asc" | "desc";
    };
    removeKeys?: string[];
    leaveKeys?: string[];
}
declare const getDocs: (col: string, panel_id?: number | null, query?: QueryOptions) => Promise<any>;
declare const createTableIfNotExists: (pool: Pool, col: string, data: Record<string, any>) => Promise<void>;
declare const ensureColumnsExist: (pool: Pool, table: string, records: any[]) => Promise<void>;
declare const addDoc: (col: string, data: any) => Promise<any>;
declare const addPanelDoc: (col: string, data: any, panel_id: number) => Promise<any>;
declare const addDocs: (col: string, docs: any[]) => Promise<any>;
declare const addPanelDocs: (col: string, docs: any[], panel_id: number) => Promise<any>;
declare const deleteDoc: (col: string, uid: string) => Promise<void>;
declare const deletePanelDoc: (col: string, uid: string, panel_id: number) => Promise<void>;
declare const deleteDocs: (col: string, uids: string[]) => Promise<void>;
declare const deletePanelDocs: (col: string, uids: string[], panel_id: number) => Promise<void>;
declare const updateDoc: (col: string, uid: string, newData: Record<string, any>) => Promise<void>;
declare const updatePanelDoc: (col: string, uid: string, newData: Record<string, any>, panel_id: number) => Promise<void>;
export { getDocs, addDoc, addPanelDoc, addDocs, addPanelDocs, deleteDoc, deletePanelDoc, deleteDocs, deletePanelDocs, updateDoc, updatePanelDoc, createTableIfNotExists, ensureColumnsExist, };
