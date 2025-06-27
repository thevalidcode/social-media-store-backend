import { z } from "zod";
export declare const ProviderListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
                uid: z.ZodString;
                name: z.ZodString;
                url: z.ZodString;
                percentage: z.ZodNumber;
                sync: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                uid: string;
                url: string;
                name: string;
                percentage: number;
                sync: boolean;
            }, {
                uid: string;
                url: string;
                name: string;
                percentage: number;
                sync: boolean;
            }>, "many">;
        };
    };
};
export declare const ProviderServicesListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
                service: z.ZodNumber;
                name: z.ZodString;
                type: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
                price: z.ZodNumber;
                category: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                network: z.ZodOptional<z.ZodString>;
                drip_feed: z.ZodOptional<z.ZodBoolean>;
                cancel: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                price: number;
                name: string;
                type: string;
                category: string;
                min: number;
                max: number;
                service: number;
                description?: string | undefined;
                drip_feed?: boolean | undefined;
                network?: string | undefined;
                cancel?: boolean | undefined;
            }, {
                price: number;
                name: string;
                type: string;
                category: string;
                min: number;
                max: number;
                service: number;
                description?: string | undefined;
                drip_feed?: boolean | undefined;
                network?: string | undefined;
                cancel?: boolean | undefined;
            }>, "many">;
        };
    };
};
export declare const successWithProvider: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Provider updated successfully.">;
                provider: z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    url: z.ZodString;
                    percentage: z.ZodNumber;
                    sync: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    uid: string;
                    url: string;
                    name: string;
                    percentage: number;
                    sync: boolean;
                }, {
                    uid: string;
                    url: string;
                    name: string;
                    percentage: number;
                    sync: boolean;
                }>;
            }, "strip", z.ZodTypeAny, {
                provider: {
                    uid: string;
                    url: string;
                    name: string;
                    percentage: number;
                    sync: boolean;
                };
                success: "Provider updated successfully.";
            }, {
                provider: {
                    uid: string;
                    url: string;
                    name: string;
                    percentage: number;
                    sync: boolean;
                };
                success: "Provider updated successfully.";
            }>;
        };
    };
};
