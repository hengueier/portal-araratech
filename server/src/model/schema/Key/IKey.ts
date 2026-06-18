import { Document } from "mongoose";

export interface IKey {
  id: string;
  name?: string;
  key: string;
  scope: any;
  date_created: Date;
  active: boolean;
  account_id: string;
}

export interface IKeyDocument extends Omit<IKey, "id">, Document {
  id: string;
}
