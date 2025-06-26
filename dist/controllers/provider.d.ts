import type { Request, Response } from "express";
export declare const importServices: (req: Request, res: Response) => Promise<void>;
export declare const addProvider: (req: Request, res: Response) => Promise<void>;
export declare const getProviders: (req: Request, res: Response) => Promise<void>;
export declare const updateService: (req: Request, res: Response) => Promise<void>;
