import { Document } from "mongoose";

export interface TokenData {
  accountId: string;
  userId: string;
  permission: string;
  provider: string;
}
