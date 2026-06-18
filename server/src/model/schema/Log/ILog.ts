import { Document } from "mongoose";

export interface ILog {
  id: string;
  time: Date;
  message?: string | null;
  body?: { plan?: string };
  method?: string;
  req?: any;
  endpoint?: string;
  account_id?: string;
  user_id?: string;
  sendNotification?: boolean;
  account?: string;
}

export interface ILogDocument extends Omit<ILog, "id">, Document {
  id: string;
}
