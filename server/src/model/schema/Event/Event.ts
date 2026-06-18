import Model from "../Model";
import { IEventDocument } from "./IEvent";

export class Event extends Model<IEventDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        metadata: { type: Object },
        time: { type: Date, required: true },
        user_id: { type: String },
        account_id: { type: String },
      },
      "Event",
    );
  }

  public custom = {
    /*
     * event.create()
     * create a new event
     */

    create: async ({
      data,
      user,
      account,
    }: {
      data: any;
      user: string;
      account: string;
    }) => {
      data.user_id = user;
      data.account_id = account;
      data.time = new Date();

      return await this.create.new(data);
    },
  };
}
