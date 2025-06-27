import { z } from "zod";
export declare const UpdateSuccess: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                code: z.ZodLiteral<"update-success">;
            }, "strip", z.ZodTypeAny, {
                code: "update-success";
            }, {
                code: "update-success";
            }>;
        };
    };
};
export declare const InvalidData: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                error: z.ZodLiteral<"No valid fields to update">;
            }, "strip", z.ZodTypeAny, {
                error: "No valid fields to update";
            }, {
                error: "No valid fields to update";
            }>;
        };
    };
};
export declare const UsersListResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodArray<z.ZodObject<{
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
            }>, "many">;
        };
    };
};
export declare const UserObject: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                user: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                user: {
                    password: string;
                    id: string;
                    username: string;
                    email: string;
                    api_key: string;
                    role: string;
                    status: string;
                };
            }, {
                user: {
                    password: string;
                    id: string;
                    username: string;
                    email: string;
                    api_key: string;
                    role: string;
                    status: string;
                };
            }>;
        };
    };
};
export declare const LoginResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Logged in successfully">;
                token: z.ZodString;
                role: z.ZodString;
                user: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                user: {
                    id: string;
                    username: string;
                    email: string;
                };
                success: "Logged in successfully";
                role: string;
                token: string;
            }, {
                user: {
                    id: string;
                    username: string;
                    email: string;
                };
                success: "Logged in successfully";
                role: string;
                token: string;
            }>;
        };
    };
};
export declare const SuccessMessage: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                success: z.ZodLiteral<"Created Successfully">;
                token: z.ZodString;
                user: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                user: {
                    id: string;
                    username: string;
                    email: string;
                };
                success: "Created Successfully";
                token: string;
            }, {
                user: {
                    id: string;
                    username: string;
                    email: string;
                };
                success: "Created Successfully";
                token: string;
            }>;
        };
    };
};
export declare const AccessDenied: {
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
export declare const Unauthorized: {
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
export declare const GoogleLoginResponse: {
    description: string;
    content: {
        "application/json": {
            schema: z.ZodObject<{
                token: z.ZodString;
                user: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                user: {
                    password: string;
                    id: string;
                    username: string;
                    email: string;
                    api_key: string;
                    role: string;
                    status: string;
                };
                token: string;
            }, {
                user: {
                    password: string;
                    id: string;
                    username: string;
                    email: string;
                    api_key: string;
                    role: string;
                    status: string;
                };
                token: string;
            }>;
        };
    };
};
