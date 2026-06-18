import { Document } from "mongoose";

export interface IToken {
  id: string;
  provider: string;
  jwt?: string;
  access?: string;
  refresh?: string;
  user_id: string;
}

export interface ITokenDocument extends Omit<IToken, "id">, Document {
  id: string;
}
