import type { Request, Response } from "express";
export declare const getCategories: (req: Request, res: Response) => Promise<void>;
export declare const getCategoryByID: (req: Request, res: Response) => Promise<void>;
export declare const updateCategory: (req: Request, res: Response) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<void>;
export declare const deleteMultipleCategory: (req: Request, res: Response) => Promise<void>;
export declare const addCategory: (req: Request, res: Response) => Promise<void>;
