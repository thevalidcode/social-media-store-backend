import { z } from "zod";
export declare const AuthSchema: z.ZodObject<{
    panel_id: z.ZodNumber;
    email: z.ZodString;
    uid: z.ZodString;
    api_key: z.ZodString;
    role: z.ZodString;
    user: z.ZodObject<{}, "strip", z.ZodUnknown, z.objectOutputType<{}, z.ZodUnknown, "strip">, z.objectInputType<{}, z.ZodUnknown, "strip">>;
}, "strip", z.ZodTypeAny, {
    user: {} & {
        [k: string]: unknown;
    };
    uid: string;
    email: string;
    panel_id: number;
    api_key: string;
    role: string;
}, {
    user: {} & {
        [k: string]: unknown;
    };
    uid: string;
    email: string;
    panel_id: number;
    api_key: string;
    role: string;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    status: z.ZodString;
    api_key: z.ZodString;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    id: string;
    username: string;
    email: string;
    api_key: string;
    role: string;
    status: string;
}, {
    password: string;
    id: string;
    username: string;
    email: string;
    api_key: string;
    role: string;
    status: string;
}>;
export declare const UserPublicSchema: z.ZodObject<{
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
export declare const UserUpdateRequestSchema: z.ZodObject<{
    uid: z.ZodString;
    username: z.ZodString;
    full_name: z.ZodString;
    balance: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    uid: string;
    username: string;
    full_name: string;
    balance: number;
}, {
    uid: string;
    username: string;
    full_name: string;
    balance: number;
}>;
export declare const AuthenticateUserSchema: z.ZodObject<{
    panel_id: z.ZodNumber;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    panel_id: number;
}, {
    password: string;
    email: string;
    panel_id: number;
}>;
export declare const AuthenticateUserResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<"Logged in successfully">;
    role: z.ZodEnum<["user", "admin"]>;
    token: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodNumber;
        email: z.ZodString;
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        username: string;
        email: string;
    }, {
        id: number;
        username: string;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        id: number;
        username: string;
        email: string;
    };
    success: "Logged in successfully";
    role: "user" | "admin";
    token: string;
}, {
    user: {
        id: number;
        username: string;
        email: string;
    };
    success: "Logged in successfully";
    role: "user" | "admin";
    token: string;
}>;
export declare const CreateUserInputSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    panel_id: z.ZodNumber;
    ref: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    password: string;
    username: string;
    email: string;
    panel_id: number;
    ref?: number | undefined;
}, {
    password: string;
    username: string;
    email: string;
    panel_id: number;
    ref?: number | undefined;
}>;
export declare const AdminPublicSchema: z.ZodObject<{
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
export declare const GoogleAuthRequestSchema: z.ZodObject<{
    id_token: z.ZodString;
    panel_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    panel_id: number;
    id_token: string;
}, {
    panel_id: number;
    id_token: string;
}>;
