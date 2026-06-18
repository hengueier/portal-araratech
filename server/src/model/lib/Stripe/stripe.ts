import config from "config";
import Stripe from "stripe";

export default class StripeService {
  private stripe: Stripe;
  private settings: any = config.get("stripe");

  constructor(apiKey = process.env.STRIPE_SECRET_API_KEY) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2022-11-15",
    });
  }

  async getSubscription(id: string) {
    return await this.stripe.subscriptions.retrieve(id, {
      expand: ["latest_invoice.payment_intent"],
    });
  }

  async updateSubscription({
    subscription,
    plan,
  }: {
    subscription: Stripe.Subscription;
    plan: string;
  }) {
    return await this.stripe.subscriptions.update(subscription.id, {
      items: [{ id: subscription.items.data[0].id, plan: plan }],
    });
  }

  async deleteSubscription(id: string) {
    return await this.stripe.subscriptions.del(id);
  }

  async getCustomer(id: string) {
    return await this.stripe.customers.retrieve(id, {
      expand: ["sources"],
    });
  }

  async createCustomer({ email, token }: { email: string; token: string }) {
    return await this.stripe.customers.create({
      email: email,
      source: token,
    });
  }

  async updateCustomer({ id, token }: { id: string; token: string }) {
    return await this.stripe.customers.update(id, {
      source: token,
    });
  }

  async listInvoices({ id, limit }: { id: string; limit: number | null }) {
    return await this.stripe.invoices.list({
      customer: id,
      limit: limit,
    });
  }

  async subscribeCustomer({ id, plan }: { id: string; plan: string }) {
    const subscription: any = await this.stripe.subscriptions.create({
      customer: id,
      items: [{ plan: plan }],
      // enable_incomplete_payments: true, // FIX: Verify this
      expand: ["latest_invoice.payment_intent"],
    });

    // add the price
    subscription.price =
      this.settings.currencySymbol +
      (subscription.items.data[0].plan.amount / 100).toFixed(2);

    return subscription;
  }

  async deleteCustomer(id: string) {
    return await this.stripe.customers.del(id);
  }
}
