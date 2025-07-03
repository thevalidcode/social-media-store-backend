import { z } from "zod";
export declare const OrderPublicSchema: z.ZodObject<{
    id: z.ZodNumber;
    price: z.ZodNumber;
    quantity: z.ZodNumber;
    start: z.ZodNumber;
    remains: z.ZodNumber;
    user_initial_balance: z.ZodNumber;
    user_final_balance: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["Pending", "Processing", "Completed", "Canceled", "In progress", "Failed"]>;
    url: z.ZodString;
    uid: z.ZodString;
    service_id: z.ZodNumber;
    comments: z.ZodOptional<z.ZodString>;
    drip_feed: z.ZodOptional<z.ZodBoolean>;
    interval: z.ZodOptional<z.ZodNumber>;
    user_uid: z.ZodString;
    timestamp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    timestamp: string;
    id: number;
    uid: string;
    url: string;
    price: number;
    service_id: number;
    currency: string;
    status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    quantity: number;
    start: number;
    remains: number;
    user_initial_balance: number;
    user_final_balance: number;
    user_uid: string;
    drip_feed?: boolean | undefined;
    comments?: string | undefined;
    interval?: number | undefined;
}, {
    timestamp: string;
    id: number;
    uid: string;
    url: string;
    price: number;
    service_id: number;
    currency: string;
    status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    quantity: number;
    start: number;
    remains: number;
    user_initial_balance: number;
    user_final_balance: number;
    user_uid: string;
    drip_feed?: boolean | undefined;
    comments?: string | undefined;
    interval?: number | undefined;
}>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodNumber;
    price: z.ZodNumber;
    quantity: z.ZodNumber;
    start: z.ZodNumber;
    remains: z.ZodNumber;
    user_initial_balance: z.ZodNumber;
    user_final_balance: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["Pending", "Processing", "Completed", "Canceled", "In progress", "Failed"]>;
    url: z.ZodString;
    uid: z.ZodString;
    service_id: z.ZodNumber;
    provider_service_id: z.ZodOptional<z.ZodNumber>;
    provider_order_id: z.ZodOptional<z.ZodNumber>;
    provider_currency: z.ZodOptional<z.ZodString>;
    provider_error: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodString>;
    comments: z.ZodOptional<z.ZodString>;
    drip_feed: z.ZodOptional<z.ZodBoolean>;
    sync_order: z.ZodOptional<z.ZodBoolean>;
    synced: z.ZodOptional<z.ZodBoolean>;
    interval: z.ZodOptional<z.ZodNumber>;
    user_uid: z.ZodString;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    id: number;
    uid: string;
    url: string;
    price: number;
    service_id: number;
    currency: string;
    status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    quantity: number;
    start: number;
    remains: number;
    user_initial_balance: number;
    user_final_balance: number;
    user_uid: string;
    provider?: string | undefined;
    provider_error?: string | undefined;
    provider_currency?: string | undefined;
    drip_feed?: boolean | undefined;
    comments?: string | undefined;
    interval?: number | undefined;
    provider_service_id?: number | undefined;
    provider_order_id?: number | undefined;
    sync_order?: boolean | undefined;
    synced?: boolean | undefined;
}, {
    timestamp: string;
    id: number;
    uid: string;
    url: string;
    price: number;
    service_id: number;
    currency: string;
    status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    quantity: number;
    start: number;
    remains: number;
    user_initial_balance: number;
    user_final_balance: number;
    user_uid: string;
    provider?: string | undefined;
    provider_error?: string | undefined;
    provider_currency?: string | undefined;
    drip_feed?: boolean | undefined;
    comments?: string | undefined;
    interval?: number | undefined;
    provider_service_id?: number | undefined;
    provider_order_id?: number | undefined;
    sync_order?: boolean | undefined;
    synced?: boolean | undefined;
}>;
export declare const placeOrderSchema: z.ZodObject<{
    quantity: z.ZodNumber;
    url: z.ZodString;
    service_id: z.ZodNumber;
    comments: z.ZodOptional<z.ZodString>;
    drip_feed: z.ZodOptional<z.ZodBoolean>;
    interval: z.ZodOptional<z.ZodNumber>;
    runs: z.ZodOptional<z.ZodNumber>;
    user_uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    service_id: number;
    quantity: number;
    user_uid: string;
    drip_feed?: boolean | undefined;
    comments?: string | undefined;
    interval?: number | undefined;
    runs?: number | undefined;
}, {
    url: string;
    service_id: number;
    quantity: number;
    user_uid: string;
    drip_feed?: boolean | undefined;
    comments?: string | undefined;
    interval?: number | undefined;
    runs?: number | undefined;
}>;
export declare const updateOrderSchema: z.ZodObject<{
    update: z.ZodObject<{
        status: z.ZodEnum<["Pending", "Processing", "Completed", "Canceled", "In progress", "Failed"]>;
        url: z.ZodString;
        remains: z.ZodNumber;
        comments: z.ZodOptional<z.ZodString>;
        sync_order: z.ZodOptional<z.ZodBoolean>;
        start: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
        remains: number;
        start?: number | undefined;
        comments?: string | undefined;
        sync_order?: boolean | undefined;
    }, {
        url: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
        remains: number;
        start?: number | undefined;
        comments?: string | undefined;
        sync_order?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    update: {
        url: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
        remains: number;
        start?: number | undefined;
        comments?: string | undefined;
        sync_order?: boolean | undefined;
    };
}, {
    update: {
        url: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
        remains: number;
        start?: number | undefined;
        comments?: string | undefined;
        sync_order?: boolean | undefined;
    };
}>;
export declare const getOrdersByStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["all", "Pending", "Processing", "Completed", "Canceled", "In progress", "Failed"]>;
}, "strip", z.ZodTypeAny, {
    status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed" | "all";
}, {
    status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed" | "all";
}>;
export declare const bulkCreateSchema: z.ZodObject<{
    orders: z.ZodArray<z.ZodObject<{
        quantity: z.ZodNumber;
        url: z.ZodString;
        service_id: z.ZodNumber;
        comments: z.ZodOptional<z.ZodString>;
        drip_feed: z.ZodOptional<z.ZodBoolean>;
        interval: z.ZodOptional<z.ZodNumber>;
        user_uid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        service_id: number;
        quantity: number;
        user_uid: string;
        drip_feed?: boolean | undefined;
        comments?: string | undefined;
        interval?: number | undefined;
    }, {
        url: string;
        service_id: number;
        quantity: number;
        user_uid: string;
        drip_feed?: boolean | undefined;
        comments?: string | undefined;
        interval?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    orders: {
        url: string;
        service_id: number;
        quantity: number;
        user_uid: string;
        drip_feed?: boolean | undefined;
        comments?: string | undefined;
        interval?: number | undefined;
    }[];
}, {
    orders: {
        url: string;
        service_id: number;
        quantity: number;
        user_uid: string;
        drip_feed?: boolean | undefined;
        comments?: string | undefined;
        interval?: number | undefined;
    }[];
}>;
export declare const bulkStatusUpdateSchema: z.ZodObject<{
    updates: z.ZodArray<z.ZodObject<{
        uid: z.ZodString;
        status: z.ZodEnum<["Pending", "Processing", "Completed", "Canceled", "In progress", "Failed"]>;
    }, "strip", z.ZodTypeAny, {
        uid: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    }, {
        uid: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    updates: {
        uid: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    }[];
}, {
    updates: {
        uid: string;
        status: "Pending" | "Processing" | "Completed" | "Canceled" | "In progress" | "Failed";
    }[];
}>;
