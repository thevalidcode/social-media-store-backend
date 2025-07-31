import type { Request, Response, NextFunction } from "express";

export const isAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.auth?.role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    next();
};

export const isUser = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.auth?.role !== "user") {
        res.status(403).json({ error: "Access denied. Users only." });
        return;
    }
    next();
};