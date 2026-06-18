import mongoose, { Document, Schema, Model } from "mongoose";

export interface TokenDocument extends Document {
  id: string;
  provider: string;
  jwt?: string;
  access?: string;
  refresh?: string;
  user_id: string;
}
