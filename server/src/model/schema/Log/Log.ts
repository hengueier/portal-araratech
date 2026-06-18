import Model from "../Model";
import { ILogDocument } from "./ILog";

export class Log extends Model<ILogDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        time: { type: Date, required: true },
        message: { type: String },
        body: { plan: { type: String } },
        method: { type: String },
        endpoint: { type: String },
        account_id: { type: String },
        user_id: { type: String },
      },
      "Log",
    );
  }

  public custom = {
    create: {
      /*
       * log.create()
       * create a new log
       * method, endpoint, user_id, and account_id will be extracted from the req object
       * pass user, account IDs if not available in req
       * message is a string, body can be used for a string or object
       */
      new: async ({
        message,
        body = null,
        req,
        user = null,
        account = null,
      }) => {
        const newLog = {
          message: message,
          time: new Date(),
          user_id: req?.user || user,
          account_id: req?.account || account,
          endpoint: req?.route?.path,
          body:
            body &&
            (typeof body === "object"
              ? JSON.stringify(body, Object.getOwnPropertyNames(body))
              : body),
          method: req
            ? Object.keys(req.route.methods).reduce((key) => {
                return req.route.methods[key];
              }, "")
            : null,
        };

        return await this.create.new(newLog);
      },
    },
  };
}
