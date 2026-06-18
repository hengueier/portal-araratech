import { Document } from "mongoose";

export interface KeyDocument extends Document {
  id: string;
  name?: string;
  key: string;
  scope: any;
  date_created: Date;
  active: boolean;
  account_id: string;
}
