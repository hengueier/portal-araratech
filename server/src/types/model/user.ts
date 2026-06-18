import mongoose, { Document, Schema, Model } from "mongoose";

export interface UserDocument extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  date_created?: Date;
  last_active?: Date;
  disabled?: boolean;
  support_enabled: boolean;
  "2fa_enabled": boolean;
  "2fa_secret"?: string;
  "2fa_backup_code"?: string;
  default_account: string;
  facebook_id?: string;
  twitter_id?: string;
  account: any;
  // FIX: This Type
  // account: Array<{
  //   id: string;
  //   permission: string;
  //   onboarded: boolean;
  // }>;
  push_token?: string;
}
