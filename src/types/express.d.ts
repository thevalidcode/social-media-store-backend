import { Request } from "express";

export interface AuthPayload {
  email: string;
  panel_id: number;
  key: string;
  role: string;
  user: any;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthPayload;
}
