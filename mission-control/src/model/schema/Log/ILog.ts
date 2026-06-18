import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILog extends Document {
  id: string;
  time: Date;
  message?: string;
  body?: string;
  method?: string;
  endpoint?: string;
  account_id?: string;
  user_id?: string;
}
