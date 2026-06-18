import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILog } from './ILog';


const LogSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  time: { type: Date, required: true },
  message: { type: String },
  body: { type: String },
  method: { type: String },
  endpoint: { type: String },
  account_id: { type: String },
  user_id: { type: String }
});

const Log: Model<ILog> = mongoose.model<ILog>('Log', LogSchema, 'log');

interface Filter {
  search?: string;
  limit?: string;
  offset?: string;
}

export const get = async ({ id, filter }: { id?: string; filter?: Filter }) => {
  if (id) {
    const data = await Log.findOne({ id }).lean().exec();
    if (data) {
      delete (data as any).__v;
      return [data];
    }
    return [];
  }

  let selector: any = {};

  if (filter?.search) {
    const s = { $regex: filter.search, $options: 'i' };
    selector = {
      $or: [
        { message: s },
        { body: s },
        { method: s },
        { endpoint: s },
        { email: s }
      ]
    };
  }

  const data = await Log.find(selector)
    .limit(parseInt(filter?.limit || '0'))
    .skip(parseInt(filter?.offset || '0'))
    .exec();

  const total = await Log.countDocuments().exec();

  return {
    results: data,
    total
  };
}

export const deleteLog = async (id: string) => {
  return await Log.deleteOne({ id }).exec();
}