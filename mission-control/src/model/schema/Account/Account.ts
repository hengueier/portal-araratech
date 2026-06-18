import { v4 as uuidv4 } from "uuid";
import mongoose, { Document, Model } from "mongoose";
const { Schema } = mongoose;

import { IAccount } from "./IAccount";

const AccountSchema = new Schema<IAccount>({
  id: { type: String, required: true, unique: true },
  plan: { type: String },
  name: { type: String },
  active: { type: Boolean, required: true },
  stripe_subscription_id: { type: String },
  stripe_customer_id: { type: String },
  date_created: { type: Date, required: true },
});

const Account: Model<IAccount> = mongoose.model<IAccount>("Account", AccountSchema, "account");
export const schema = Account;

interface CreateAccountInput {
  name?: string;
  plan?: string;
}

export const create = async function (account: CreateAccountInput): Promise<IAccount> {
  const data = new Account({
    id: uuidv4(),
    active: true,
    name: account.name || "My Account",
    plan: account.plan || "free",
    date_created: new Date(),
  });

  const newAccount = new Account(data);
  await newAccount.save();
  return data;
};

interface GetAccountOutput {
  id: string;
  email?: string;
  plan?: string;
  active: boolean;
  date_created: Date;
}

export const get = async function (): Promise<GetAccountOutput[]> {
  const data = await Account.aggregate([
    {
      $lookup: {
        from: "user",
        localField: "id",
        foreignField: "account.id",
        as: "user",
      },
    },
  ]);

  if (data.length) {
    return data.map((a) => {
      const owner = a.user.filter((u: any) => {
        return u.account.find((x: any) => x.permission === "owner" || x.permission === "master");
      });

      return {
        id: a.id,
        email: owner?.[0]?.email,
        plan: a.plan,
        active: a.active,
        date_created: a.date_created,
      };
    });
  }

  return data;
};