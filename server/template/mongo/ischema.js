import { Document } from "mongoose";

export interface I{{capitalisedName}} {
  id: string;
  account_id: string;
}

export interface I{{capitalisedName}}Document extends Omit<I{{capitalisedName}}, "id">, Document {
  id: string;
}
