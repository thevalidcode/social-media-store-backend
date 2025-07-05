import { z } from "zod";
export declare const OrderPublicListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
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
            }>, "many">;
        };
    };
};
export declare const OrderListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
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
            }>, "many">;
        };
    };
};
export declare const OrderSingleResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
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
        };
    };
};
export declare const OrderCreatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Order added successfully.">;
                uid: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                uid: string;
                success: "Order added successfully.";
            }, {
                uid: string;
                success: "Order added successfully.";
            }>;
        };
    };
};
export declare const OrderCreatedListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Orders added successfully.">;
                uids: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                success: "Orders added successfully.";
                uids: string[];
            }, {
                success: "Orders added successfully.";
                uids: string[];
            }>;
        };
    };
};
export declare const OrderUpdatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Order updated successfully.">;
            }, "strip", z.ZodTypeAny, {
                success: "Order updated successfully.";
            }, {
                success: "Order updated successfully.";
            }>;
        };
    };
};
