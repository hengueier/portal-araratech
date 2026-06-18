import { Document } from "mongoose";

export interface IPreview {
  id: string;
  account_id: string;
}

export interface IPreviewDocument extends Omit<IPreview, "id">, Document {
  id: string;
}
