import { z } from "zod";
export declare const ProviderSchema: z.ZodObject<{
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
export declare const ProviderCreateRequestSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    percentage: z.ZodNumber;
    api_key: z.ZodString;
    sync: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    url: string;
    name: string;
    api_key: string;
    percentage: number;
    sync: boolean;
}, {
    url: string;
    name: string;
    api_key: string;
    percentage: number;
    sync: boolean;
}>;
export declare const ProviderUpdateRequestSchema: z.ZodObject<{
    uid: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    percentage: z.ZodOptional<z.ZodNumber>;
    api_key: z.ZodString;
    sync: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    uid: string;
    api_key: string;
    url?: string | undefined;
    name?: string | undefined;
    percentage?: number | undefined;
    sync?: boolean | undefined;
}, {
    uid: string;
    api_key: string;
    url?: string | undefined;
    name?: string | undefined;
    percentage?: number | undefined;
    sync?: boolean | undefined;
}>;
export declare const ImportProviderServicesRequestSchema: z.ZodObject<{
    provider_services_id: z.ZodArray<z.ZodNumber, "many">;
    import_percent: z.ZodNumber;
    category: z.ZodObject<{
        value: z.ZodString;
        label: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        label: string;
    }, {
        value: string;
        label: string;
    }>;
    provider: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider: string;
    category: {
        value: string;
        label: string;
    };
    provider_services_id: number[];
    import_percent: number;
}, {
    provider: string;
    category: {
        value: string;
        label: string;
    };
    provider_services_id: number[];
    import_percent: number;
}>;
export declare const ProviderServicesSchema: z.ZodObject<{
    provider: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider: string;
}, {
    provider: string;
}>;
export declare const ProviderServiceSchema: z.ZodObject<{
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
}>;
