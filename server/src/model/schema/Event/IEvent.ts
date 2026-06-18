import { Document } from "mongoose";

export interface IEvent {
  id: string;
  name: string;
  metadata?: { [key: string]: any };
  time: Date;
  user_id?: string;
  account_id?: string;
}

export interface IEventDocument extends Omit<IEvent, "id">, Document {
  id: string;
}
