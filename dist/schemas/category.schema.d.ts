import { z } from "zod";
export declare const CategorySchema: z.ZodObject<{
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
export declare const CategoryCreateRequestSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export declare const CategoryUpdateRequestSchema: z.ZodObject<{
    uid: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uid: string;
    name?: string | undefined;
    description?: string | undefined;
    position?: number | undefined;
}, {
    uid: string;
    name?: string | undefined;
    description?: string | undefined;
    position?: number | undefined;
}>;
