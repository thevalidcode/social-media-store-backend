import { z } from "zod";
export declare const ServicePublicListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                name: z.ZodString;
                type: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
                price: z.ZodNumber;
                category: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                network: z.ZodOptional<z.ZodString>;
                drip_feed: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                id: number;
                price: number;
                name: string;
                type: string;
                category: string;
                min: number;
                max: number;
                description?: string | undefined;
                drip_feed?: boolean | undefined;
                network?: string | undefined;
            }, {
                id: number;
                price: number;
                name: string;
                type: string;
                category: string;
                min: number;
                max: number;
                description?: string | undefined;
                drip_feed?: boolean | undefined;
                network?: string | undefined;
            }>, "many">;
        };
    };
};
export declare const ServiceListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                uid: z.ZodString;
                name: z.ZodString;
                category: z.ZodString;
                type: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
                price: z.ZodNumber;
                provider_price: z.ZodNumber;
                provider_id: z.ZodNumber;
                description: z.ZodString;
                refill_days: z.ZodNumber;
                sync_quantity: z.ZodBoolean;
                sync_cat_and_name: z.ZodBoolean;
                drip_feed: z.ZodBoolean;
                network: z.ZodString;
                refill: z.ZodBoolean;
                cancel: z.ZodBoolean;
                position: z.ZodNumber;
                status: z.ZodString;
                panel_id: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                id: number;
                uid: string;
                price: number;
                name: string;
                type: string;
                category: string;
                min: number;
                max: number;
                provider_price: number;
                panel_id: number;
                description: string;
                status: string;
                provider_id: number;
                refill_days: number;
                sync_quantity: boolean;
                sync_cat_and_name: boolean;
                drip_feed: boolean;
                network: string;
                refill: boolean;
                cancel: boolean;
                position: number;
            }, {
                id: number;
                uid: string;
                price: number;
                name: string;
                type: string;
                category: string;
                min: number;
                max: number;
                provider_price: number;
                panel_id: number;
                description: string;
                status: string;
                provider_id: number;
                refill_days: number;
                sync_quantity: boolean;
                sync_cat_and_name: boolean;
                drip_feed: boolean;
                network: string;
                refill: boolean;
                cancel: boolean;
                position: number;
            }>, "many">;
        };
    };
};
export declare const SingleServiceResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                service: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    category: z.ZodString;
                    type: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    price: z.ZodNumber;
                    provider_price: z.ZodNumber;
                    provider_id: z.ZodNumber;
                    description: z.ZodString;
                    refill_days: z.ZodNumber;
                    sync_quantity: z.ZodBoolean;
                    sync_cat_and_name: z.ZodBoolean;
                    drip_feed: z.ZodBoolean;
                    network: z.ZodString;
                    refill: z.ZodBoolean;
                    cancel: z.ZodBoolean;
                    position: z.ZodNumber;
                    status: z.ZodString;
                    panel_id: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                }, {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                service: {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                };
            }, {
                service: {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                };
            }>;
        };
    };
};
export declare const SingleServicePublicResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                service: z.ZodObject<{
                    id: z.ZodNumber;
                    name: z.ZodString;
                    type: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    price: z.ZodNumber;
                    category: z.ZodString;
                    description: z.ZodOptional<z.ZodString>;
                    network: z.ZodOptional<z.ZodString>;
                    drip_feed: z.ZodOptional<z.ZodBoolean>;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    description?: string | undefined;
                    drip_feed?: boolean | undefined;
                    network?: string | undefined;
                }, {
                    id: number;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    description?: string | undefined;
                    drip_feed?: boolean | undefined;
                    network?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                service: {
                    id: number;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    description?: string | undefined;
                    drip_feed?: boolean | undefined;
                    network?: string | undefined;
                };
            }, {
                service: {
                    id: number;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    description?: string | undefined;
                    drip_feed?: boolean | undefined;
                    network?: string | undefined;
                };
            }>;
        };
    };
};
export declare const ServiceCreated: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Service added successfully.">;
                service: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    category: z.ZodString;
                    type: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    price: z.ZodNumber;
                    provider_price: z.ZodNumber;
                    provider_id: z.ZodNumber;
                    description: z.ZodString;
                    refill_days: z.ZodNumber;
                    sync_quantity: z.ZodBoolean;
                    sync_cat_and_name: z.ZodBoolean;
                    drip_feed: z.ZodBoolean;
                    network: z.ZodString;
                    refill: z.ZodBoolean;
                    cancel: z.ZodBoolean;
                    position: z.ZodNumber;
                    status: z.ZodString;
                    panel_id: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                }, {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                success: "Service added successfully.";
                service: {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                };
            }, {
                success: "Service added successfully.";
                service: {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                };
            }>;
        };
    };
};
export declare const ServiceDeleted: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Service deleted successfully.">;
            }, "strip", z.ZodTypeAny, {
                success: "Service deleted successfully.";
            }, {
                success: "Service deleted successfully.";
            }>;
        };
    };
};
export declare const ServicesDeleted: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Services deleted successfully.">;
            }, "strip", z.ZodTypeAny, {
                success: "Services deleted successfully.";
            }, {
                success: "Services deleted successfully.";
            }>;
        };
    };
};
export declare const ServiceUpdated: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Service updated successfully.">;
                service: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    category: z.ZodString;
                    type: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    price: z.ZodNumber;
                    provider_price: z.ZodNumber;
                    provider_id: z.ZodNumber;
                    description: z.ZodString;
                    refill_days: z.ZodNumber;
                    sync_quantity: z.ZodBoolean;
                    sync_cat_and_name: z.ZodBoolean;
                    drip_feed: z.ZodBoolean;
                    network: z.ZodString;
                    refill: z.ZodBoolean;
                    cancel: z.ZodBoolean;
                    position: z.ZodNumber;
                    status: z.ZodString;
                    panel_id: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                }, {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                success: "Service updated successfully.";
                service: {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                };
            }, {
                success: "Service updated successfully.";
                service: {
                    id: number;
                    uid: string;
                    price: number;
                    name: string;
                    type: string;
                    category: string;
                    min: number;
                    max: number;
                    provider_price: number;
                    panel_id: number;
                    description: string;
                    status: string;
                    provider_id: number;
                    refill_days: number;
                    sync_quantity: boolean;
                    sync_cat_and_name: boolean;
                    drip_feed: boolean;
                    network: string;
                    refill: boolean;
                    cancel: boolean;
                    position: number;
                };
            }>;
        };
    };
};
