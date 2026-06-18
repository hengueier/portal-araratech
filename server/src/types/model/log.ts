import mongoose, { Document, Model, Schema } from "mongoose";

export interface LogDocument extends Document {
  id: string;
  time: Date;
  message?: string;
  body?: string;
  method?: string;
  endpoint?: string;
  account_id?: string;
  user_id?: string;
}
