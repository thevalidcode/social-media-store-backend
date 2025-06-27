import { z } from "zod";
export declare const PanelDataResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                panel_id: z.ZodNumber;
                plan: z.ZodString;
                timestamp: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                timestamp: string;
                panel_id: number;
                plan: string;
            }, {
                timestamp: string;
                panel_id: number;
                plan: string;
            }>;
        };
    };
};
export declare const DesignStylesResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                id: z.ZodNumber;
                title: z.ZodString;
                hex: z.ZodString;
                schema: z.ZodObject<{
                    ":root": z.ZodRecord<z.ZodString, z.ZodString>;
                    ".dark": z.ZodRecord<z.ZodString, z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    ":root": Record<string, string>;
                    ".dark": Record<string, string>;
                }, {
                    ":root": Record<string, string>;
                    ".dark": Record<string, string>;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: number;
                title: string;
                schema: {
                    ":root": Record<string, string>;
                    ".dark": Record<string, string>;
                };
                hex: string;
            }, {
                id: number;
                title: string;
                schema: {
                    ":root": Record<string, string>;
                    ".dark": Record<string, string>;
                };
                hex: string;
            }>;
        };
    };
};
export declare const SiteDataResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                logo_url: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description: string;
                title: string;
                logo_url: string;
            }, {
                description: string;
                title: string;
                logo_url: string;
            }>;
        };
    };
};
export declare const ExchangeRatesResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodRecord<z.ZodString, z.ZodNumber>;
        };
    };
};
export declare const CurrentUserResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                username: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                username: string;
                email: string;
            }, {
                id: string;
                username: string;
                email: string;
            }>;
        };
    };
};
export declare const CurrentAdminResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                username: z.ZodString;
                role: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                username: string;
                email: string;
                role: string;
            }, {
                id: string;
                username: string;
                email: string;
                role: string;
            }>;
        };
    };
};
export declare const NotFound: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
        };
    };
};
