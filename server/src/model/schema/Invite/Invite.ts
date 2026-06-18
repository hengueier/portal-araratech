import randomstring from "randomstring";
import Model from "../Model";
import { IInviteDocument } from "./IInvite";

export class Invite extends Model<IInviteDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        permission: { type: String, required: true },
        account_id: { type: String, required: true },
        date_sent: { type: Date, required: true },
        used: { type: Boolean, required: true },
      },
      "Invite",
    );
  }

  public custom = {
    create: {
      /*
       * invite.create()
       * create a new user invite to join an account
       */
      create: async ({
        email,
        permission,
        account,
      }: {
        email: string;
        permission?: string;
        account: string;
      }) => {
        // create a new invite
        const data = {
          email,
          used: false,
          permission: permission || "user",
          date_sent: new Date(),
          account_id: account,
        };

        await this.create.new(data);
        return data;
      },
    },
    read: {
      /*
       * invite.get()
       * return the invite for the new user
       */
      get: async ({
        id,
        email,
        account,
        returnArray,
      }: {
        id?: string;
        email?: string;
        account?: string;
        returnArray?: boolean;
      }) => {
        const data = await this.model.find({
          ...(id && { id: id }),
          ...(email && { email: email }),
          ...(account && { account_id: account }),
          used: false,
        });

        return data.length ? (returnArray ? data : data[0]) : null;
      },
    },
    update: {
      /*
       * invite.update()
       * update the invite
       */
      update: async ({
        id,
        data,
      }: {
        id: string;
        data: Partial<IInviteDocument>;
      }) => {
        // set invite status to used so it can't be used again
        await this.model.updateOne({ id: id }, data);
        return data;
      },
    },
    delete: {
      /*
       * invite.delete()
       * delete an invite
       */
      deleteInvite: async ({
        id,
        account,
      }: {
        id: string;
        account: string;
      }) => {
        return await this.model.deleteOne({ id: id, account_id: account });
      },
    },
  };
}
