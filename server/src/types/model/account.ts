import { Document } from "mongoose";

export interface AccountDocument extends Document {
  id: string;
  plan: string;
  name?: string;
  active: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  date_created: Date;
}
