import { z } from "zod";
export declare const SuccessResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Operation completed successfully.">;
            }, "strip", z.ZodTypeAny, {
                success: "Operation completed successfully.";
            }, {
                success: "Operation completed successfully.";
            }>;
        };
    };
};
export declare const SuccessWithData: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Provider updated successfully.">;
                service: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                success: "Provider updated successfully.";
                service?: any;
            }, {
                success: "Provider updated successfully.";
                service?: any;
            }>;
        };
    };
};
export declare const BadRequest: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                error: z.ZodObject<{
                    body: z.ZodOptional<z.ZodObject<{
                        _errors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    }, "strip", z.ZodTypeAny, {
                        _errors?: string[] | undefined;
                    }, {
                        _errors?: string[] | undefined;
                    }>>;
                    field: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    field?: string[] | undefined;
                    body?: {
                        _errors?: string[] | undefined;
                    } | undefined;
                }, {
                    field?: string[] | undefined;
                    body?: {
                        _errors?: string[] | undefined;
                    } | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                error: {
                    field?: string[] | undefined;
                    body?: {
                        _errors?: string[] | undefined;
                    } | undefined;
                };
            }, {
                error: {
                    field?: string[] | undefined;
                    body?: {
                        _errors?: string[] | undefined;
                    } | undefined;
                };
            }>;
        };
    };
};
export declare const Forbidden: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                error: z.ZodLiteral<"Access denied. Admins only.">;
            }, "strip", z.ZodTypeAny, {
                error: "Access denied. Admins only.";
            }, {
                error: "Access denied. Admins only.";
            }>;
        };
    };
};
export declare const ServerError: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                error: z.ZodLiteral<"Something went wrong. Please try again later.">;
            }, "strip", z.ZodTypeAny, {
                error: "Something went wrong. Please try again later.";
            }, {
                error: "Something went wrong. Please try again later.";
            }>;
        };
    };
};
