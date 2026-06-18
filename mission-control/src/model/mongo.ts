import mongoose, { ConnectOptions } from "mongoose";

interface Settings extends ConnectOptions {}

export const connect = async (settings: Settings): Promise<void> => {
  try {
    const url = `mongodb+srv://${
      process.env.DB_USER
    }:${encodeURIComponent(process.env.DB_PASSWORD as string)}@${
      process.env.DB_HOST
    }/${process.env.DB_NAME}`;
    await mongoose.connect(url, settings);
    console.log("Connected to Mongo 👍");
  } catch (err) {
    console.error(err);
  }
};
