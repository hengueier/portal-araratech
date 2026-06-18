import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "./IUser";

// define schema
const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  date_created: { type: Date, default: Date.now },
  last_active: { type: Date, default: Date.now },
  disabled: { type: Boolean },
  support_enabled: { type: Boolean, required: true },
  "2fa_enabled": { type: Boolean, required: true },
  "2fa_secret": { type: String },
  "2fa_backup_code": { type: String },
  default_account: { type: String, required: true },
  facebook_id: { type: String },
  twitter_id: { type: String },
  account: { type: Array },
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema, "user");
export const schema = User;

interface CreateUserParams {
  user: {
    name: string;
    email: string;
    password?: string;
    facebook_id?: string;
    twitter_id?: string;
  };
  account: string;
}

export const create = async function ({ user, account }: CreateUserParams) {
  const data: { [key: string]: any } = {
    id: uuidv4(),
    name: user.name,
    email: user.email,
    date_created: new Date(),
    last_active: new Date(),
    support_enabled: false,
    "2fa_enabled": false,
    facebook_id: user.facebook_id,
    twitter_id: user.twitter_id,
    default_account: account,
  };

  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(user.password, salt);
  }

  const newUser = new User(data);
  await newUser.save();

  if (data.password) {
    delete data.password;
    data.has_password = true;
  }

  data.account_id = account;
  return data;
};

interface GetUserParams {
  id?: string | null;
  email?: string | null;
}

export const get = async function ({ id = null, email = null }: GetUserParams) {
  return await User.find({
    ...(id && { id }),
    ...(email && { email }),
  }).select({ _id: 0, __v: 0, password: 0 });
};

interface UpdateUserParams {
  id: string;
  data: Partial<IUser>;
}

export const update = async function ({ id, data }: UpdateUserParams) {
  await User.findOneAndUpdate({ id }, data);
  return data;
};

export const account = {};

interface AddAccountParams {
  id: string;
  account: string;
  permission: string;
}

export const addAccount = async function ({ id, account, permission }: AddAccountParams) {
  const data = await User.findOne({ id });

  if (data) {
    data.account?.push({
      id: account,
      permission,
      onboarded: false,
    });
    data.markModified("account");
    return await data.save();
  }

  throw { message: `No user with that ID` };
};

export const deleteUser = async function (id: string) {
  return await User.findOneAndRemove({ id });
};