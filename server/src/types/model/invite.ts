import mongoose, { Document, Model, Schema } from "mongoose";

export interface InviteDocument extends Document {
  id: string;
  email: string;
  permission: string;
  account_id: string;
  date_sent: Date;
  used: boolean;
}
