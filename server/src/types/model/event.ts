import mongoose, { Document, Model, Schema } from "mongoose";

export interface EventDocument extends Document {
  id: string;
  name: string;
  metadata?: object;
  time: Date;
  user_id?: string;
  account_id?: string;
}
