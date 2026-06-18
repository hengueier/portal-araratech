import { Document } from "mongoose";

export interface LoginDocument extends Document {
  id: string;
  user_id: string;
  ip: string;
  time: Date;
  browser?: string;
  device?: string;
}
