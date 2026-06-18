import mongoose, { Document, Model } from "mongoose";

export interface IAccount extends Document {
    id: string;
    plan?: string;
    name?: string;
    active: boolean;
    stripe_subscription_id?: string;
    stripe_customer_id?: string;
    date_created: Date;
  }