import type { Request, Response } from "express";
export declare const getServices: (req: Request, res: Response) => Promise<void>;
export declare const importServices: (req: Request, res: Response) => Promise<void>;
export declare const getServiceByID: (req: Request, res: Response) => Promise<void>;
