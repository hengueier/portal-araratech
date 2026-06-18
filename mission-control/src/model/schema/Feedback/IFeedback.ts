import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
    id: string;
    rating: string;
    comment?: string;
    date_created?: Date;
    user_id: string;
  }
  