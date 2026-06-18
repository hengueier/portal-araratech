import { Document } from "mongoose";

export interface IFeedback {
  id: string;
  rating: string;
  comment?: string;
  date_created: Date;
  user_id: string;
}

export interface IFeedbackDocument extends Omit<IFeedback, "id">, Document {
  id: string;
}
