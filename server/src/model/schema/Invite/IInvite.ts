import { Document } from "mongoose";

export interface IInvite {
  id: string;
  email: string;
  permission: string;
  account_id: string;
  date_sent: Date;
  used: boolean;
}

export interface IInviteDocument extends Omit<IInvite, "id">, Document {
  id: string;
}
