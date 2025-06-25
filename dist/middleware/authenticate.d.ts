import { Request, Response, NextFunction } from "express";
declare module "express" {
    interface Request {
        auth?: {
            email: string;
            panel_id: number;
            key: string;
            role: string;
            user: any;
        };
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
