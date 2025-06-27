import { Request } from "express";

export interface AuthPayload {
  email: string;
  panel_id: number;
  api_key: string;
  role: string;
  user: any;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthPayload;
}
