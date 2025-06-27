import type { Request, Response } from "express";
export declare const getProviderServices: (req: Request, res: Response) => Promise<void>;
export declare const importServices: (req: Request, res: Response) => Promise<void>;
export declare const addProvider: (req: Request, res: Response) => Promise<void>;
export declare const getProviders: (req: Request, res: Response) => Promise<void>;
export declare const updateProvider: (req: Request, res: Response) => Promise<void>;
export declare const deleteProvider: (req: Request, res: Response) => Promise<void>;
export declare const deleteMultipleProviders: (req: Request, res: Response) => Promise<void>;
