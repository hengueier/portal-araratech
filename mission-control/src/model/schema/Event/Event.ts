import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "../User/IUser";

// Define Event schema
interface IEvent extends Document {
  id: string;
  name: string;
  metadata?: Record<string, any>;
  time: Date;
  user_id?: string;
  account_id?: string;
  email?: string;
}

const EventSchema: Schema<IEvent> = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  metadata: { type: Object },
  time: { type: Date, required: true },
  user_id: { type: String },
  account_id: { type: String },
  email: { type: String },
});

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema, "event");

// Define the filter interface
interface IFilter {
  search?: string;
  group?: string;
  limit?: number;
  offset?: number;
  name?: string;
}

// Define the get function
export const get = async function ({ id, filter }: { id?: string; filter: IFilter }) {
  let data: any[] = [];
  let total = 0;

  // Get one event by id
  if (id) {
    const event = await Event.findOne({ id }).lean();
    if (event) {
      const user = await mongoose.model<IUser>("User").findOne({ id: event.user_id }).select({ email: 1 }).lean();
      event.email = user?.email;
      delete event._id;
      delete event.__v;
      delete event.user_id;
      return [event];
    }
  }

  // Group by event name
  if (filter.group) {
    data = await Event.aggregate([
      { $match: { name: { $regex: filter.search || '', $options: "i" } } },
      {
        $group: {
          _id: `$${filter.group}`,
          total_triggers: { $sum: 1 },
        },
      },
    ]);

    if (data.length) {
      data = data.map(e => ({
        name: e._id,
        total_triggers: e.total_triggers,
      }));
    }
  } else {
    data = await Event.aggregate([
      { $limit: filter.limit || 10 },
      { $skip: filter.offset || 0 },
      { $match: { name: filter.name || '' } },
      {
        $project: {
          id: 1,
          name: 1,
          time: 1,
          email: 1,
          user: 1,
          user_id: 1,
        },
      },
      {
        $lookup: {
          from: "user",
          as: "user",
          let: { id: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id", "$$id"] },
                    { $regexMatch: { input: "$email", regex: filter.search || '' } },
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    if (data.length) {
      total = await Event.countDocuments({ name: filter.name || '' });
      if (filter.search) data = data.filter(e => e.user?.length);
      data = data.map(e => ({
        id: e.id,
        name: e.name,
        time: e.time,
        user_email: e.user?.[0]?.email || null,
      }));
    }
  }

  return {
    results: data,
    total,
  };
};

// Define the times function
export const times = async function (name: string) {
  let data = await Event.aggregate([
    { $match: { name } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
        value: { $sum: 1 },
      },
    },
  ]);

  if (data.length) {
    data = data
      .sort((a, b) => new Date(a._id).getTime() - new Date(b._id).getTime())
      .map(e => ({
        time: e._id,
        total: e.value,
      }));
  }

  return data;
};

// Define the delete function
export const deleteEvent = async function ({ id, name }: { id?: string; name?: string }) {
  if (!id && !name) throw new Error("Please provide an event ID or name");

  await Event.deleteOne({ id, name });

  return id;
};