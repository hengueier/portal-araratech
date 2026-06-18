import { Document } from "mongoose";

export interface IAccount {
  id: string;
  plan: string;
  name: string;
  email?: string;
  active: boolean;
  stripe_subscription_id: string;
  stripe_customer_id?: string;
  date_created: Date;
}

export interface IAccountDocument extends Omit<IAccount, "id">, Document {
  id: string;
}
