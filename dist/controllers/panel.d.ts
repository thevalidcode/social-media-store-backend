import type { Request, Response } from "express";
export declare const getPanelId: (req: Request, res: Response) => Promise<void>;
export declare const getStyles: (req: Request, res: Response) => Promise<void>;
export declare const getSiteData: (req: Request, res: Response) => Promise<void>;
export declare const getRates: (_req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentAdmin: (req: Request, res: Response) => Promise<void>;
