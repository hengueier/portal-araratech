import mongoose, { Document, Schema, Model } from "mongoose";

export interface TrackEntry {
  path: string;
  permission: string | null;
  provider: string | null;
  created_at: Date;
}

export interface TrackerDocument extends Document {
  account_id: string;
  user_id: string;
  track: TrackEntry[];
}
