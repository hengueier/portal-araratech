import { Document } from "mongoose";

export interface ILogin {
  id: string;
  user_id: string;
  ip: string;
  time: Date;
  browser?: string;
  device?: string;
}

export interface ILoginDocument extends Omit<ILogin, "id">, Document {
  id: string;
}
