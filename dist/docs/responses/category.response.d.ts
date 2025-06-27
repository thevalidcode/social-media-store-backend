import { z } from "zod";
export declare const CategoryListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                uid: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                status: z.ZodString;
                position: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                id: number;
                uid: string;
                name: string;
                description: string;
                status: string;
                position: number;
            }, {
                id: number;
                uid: string;
                name: string;
                description: string;
                status: string;
                position: number;
            }>, "many">;
        };
    };
};
export declare const CategoryCreatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Category added successfully.">;
                category: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodString;
                    position: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                }, {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                category: {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                };
                success: "Category added successfully.";
            }, {
                category: {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                };
                success: "Category added successfully.";
            }>;
        };
    };
};
export declare const CategoryUpdatedResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Category updated successfully.">;
                category: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodString;
                    position: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                }, {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                category: {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                };
                success: "Category updated successfully.";
            }, {
                category: {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                };
                success: "Category updated successfully.";
            }>;
        };
    };
};
export declare const CategoryObject: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                category: z.ZodObject<{
                    id: z.ZodNumber;
                    uid: z.ZodString;
                    name: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodString;
                    position: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                }, {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                category: {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                };
            }, {
                category: {
                    id: number;
                    uid: string;
                    name: string;
                    description: string;
                    status: string;
                    position: number;
                };
            }>;
        };
    };
};
