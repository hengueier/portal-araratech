import mongoose, { Schema, Document, Model } from 'mongoose';
import { IFeedback } from './IFeedback'

const FeedbackSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  rating: { type: String, required: true },
  comment: { type: String },
  date_created: { type: Date, default: Date.now },
  user_id: { type: String, required: true },
});

const Feedback: Model<IFeedback> = mongoose.model<IFeedback>('Feedback', FeedbackSchema, 'feedback');

export const get = async function (id?: string) {
  const data = await Feedback.aggregate([
    {
      $project: {
        id: 1,
        rating: 1,
        user_id: 1,
        comment: { $ifNull: ['$comment', null] },
      },
    },
    {
      $lookup: {
        from: 'user',
        localField: 'user_id',
        foreignField: 'id',
        as: 'user_data',
      },
    },
  ]);

  return data.map((f) => {
    return {
      id: f.id,
      user_id: f.user_id,
      comment: f.comment,
      email: f.user_data.find((x) => x.id === f.user_id)?.email,
    };
  });
};

export const metrics = async function () {
  const data = await Feedback.aggregate([
    {
      $group: {
        _id: '$rating',
        total: { $sum: 1 },
      },
    },
  ]);

  const res: Record<string, number> = {};
  data.forEach((x) => {
    res[x._id] = x.total;
  });
  return res;
};

export const deleteFeedback = async function (id: string) {
  return await Feedback.deleteOne({ id: id });
};