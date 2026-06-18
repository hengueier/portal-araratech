import Model from "../Model";
import { IAccountDocument } from "./IAccount";
import StripeService from "../../lib/Stripe/stripe";
import Database from "../../Database";

const stripe = new StripeService();

export class Account extends Model<IAccountDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        plan: { type: String, default: "free" },
        name: { type: String },
        email: { type: String },
        active: { type: Boolean, required: true },
        stripe_subscription_id: { type: String },
        stripe_customer_id: { type: String },
        date_created: { type: Date, required: true },
      },
      "Account",
    );
  }

  public custom = {
    create: {
      /*
       * account.create()
       * create a new account and return the account id
       */

      create: async ({ plan }: { plan?: string } = {}) => {
        const data = {
          name: "My Account",
          active: true,
          date_created: new Date(),
          plan: plan || "free",
        };

        return await this.create.new(data as any);
      },
    },
    read: {
      // read methods here
      get: async (id: string) => {
        const accountData = (await this.model
          .findOne({ id: id })
          .lean()) as IAccountDocument & {
          owner_email: string;
          owner_name: string;
        };

        if (accountData) {
          const userData = await Database.User.read.one(
            {
              "account.id": id,
              $or: [
                { "account.permission": "owner" },
                { "account.permission": "master" },
              ],
            },
            { name: 1, email: 1 },
          );

          if (userData) {
            accountData.owner_email = userData.email;
            accountData.owner_name = userData.name;
          }
        }

        return accountData;
      },
      subscription: async (id: string) => {
        let subscription, status;

        const accountData = await this.model.findOne({ id: id });
        if (!accountData) throw { message: `Account doesn't exist` };

        if (accountData.plan !== "free" && accountData.stripe_subscription_id) {
          subscription = await stripe.getSubscription(
            accountData.stripe_subscription_id,
          );

          status =
            subscription?.status !== "active" &&
            subscription?.status !== "trialing"
              ? subscription?.latest_invoice?.payment_intent?.status
              : subscription.status;

          if (status !== "active" && status !== "trialing")
            await this.model.findOneAndUpdate({ id: id }, { active: false });
        } else if (accountData.plan === "free") {
          status = "active";
        }

        return {
          status: status,
          data: subscription,
        };
      },
    },

    update: {
      update: async ({
        id,
        data,
      }: {
        id: string;
        data: Record<string, any>;
      }) => {
        return await this.model.findOneAndUpdate({ id: id }, data);
      },
    },
    delete: {
      deleteAccount: async (id: string) => {
        return await this.model.findOneAndRemove({ id: id });
      },
    },
  };
}
