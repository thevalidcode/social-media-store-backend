import type { Request, Response, NextFunction } from "express";

const isDev = process.env.NODE_ENV === "development";

export const devBypass = <T extends Function>(limiter: any) => {
  if (isDev) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  return limiter as any;
};
