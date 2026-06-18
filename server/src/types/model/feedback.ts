import mongoose, { Document, Model, Schema } from "mongoose";

export interface FeedbackDocument extends Document {
  id: string;
  rating: string;
  comment?: string;
  date_created: Date;
  user_id: string;
}
