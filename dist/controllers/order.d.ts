import type { Request, Response } from "express";
export declare const getOrders: (req: Request, res: Response) => Promise<void>;
export declare const getOrderByID: (req: Request, res: Response) => Promise<void>;
export declare const placeOrder: (req: Request, res: Response) => Promise<void>;
export declare const updateOrder: (req: Request, res: Response) => Promise<void>;
export declare const deleteOrder: (req: Request, res: Response) => Promise<void>;
export declare const getOrdersByStatus: (req: Request, res: Response) => Promise<void>;
export declare const bulkCreateOrders: (req: Request, res: Response) => Promise<void>;
export declare const bulkUpdateOrderStatus: (req: Request, res: Response) => Promise<void>;
