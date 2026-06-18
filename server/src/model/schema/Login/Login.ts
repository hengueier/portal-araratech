import Model from "../Model";
import { ILoginDocument } from "./ILogin";

export class Login extends Model<ILoginDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        user_id: { type: String, required: true },
        ip: { type: String, required: true },
        time: { type: Date, required: true },
        browser: { type: String },
        device: { type: String },
      },
      "Login",
    );
  }

  public custom = {
    create: {
      /*
       * login.create()
       * store a new user login
       */
      create: async ({ user, req }: { user: string; req: any }) => {
        // get ip address
        const ip =
          (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
          req.connection?.remoteAddress ||
          req.socket?.remoteAddress ||
          req.connection?.socket?.remoteAddress;

        // get the user agent
        let ua, device, uarr, browser;
        if (process.env.NODE_ENV !== "test") {
          ua = req.headers["user-agent"];
          device =
            process.env.NODE_ENV === "test"
              ? "Test"
              : ua
                  .substring(ua.indexOf("(") + 1, ua.indexOf(")"))
                  .replace(/_/g, ".");
          uarr = ua.split(" ");
          browser = uarr[uarr.length - 1];
        } else {
          ((browser = "Mock"), (device = "Test"));
        }

        const newLogin = {
          user_id: user,
          ip: ip,
          time: new Date(),
          browser: browser,
          device: device,
        };

        return await this.create.new(newLogin);
      },
    },
    verify: {
      /*
       * login.verify()
       * check for a suspicious login based on ip, device, or browser
       * notify the user when a flag has been set but continue login
       * the risk level increases with each flag set
       * if the risk level reaches 3, the login should be blocked
       */
      verify: async ({
        user,
        current,
      }: {
        user: string;
        current: ILoginDocument;
      }) => {
        let riskLevel = 0;

        const flag = {
          ip: current.ip,
          device: current.device,
          browser: current.browser?.split("/")[0],
        };

        const history = await this.model
          .find({
            user_id: user,
            id: { $ne: current.id },
          })
          // .select() TODO: Fix what it should select... Srsly, who did this?
          .limit(500);

        // if this isn't the user's first login: perform security checks
        if (history.length) {
          // has the user logged in from this IP address before?
          if (history.findIndex((x) => x.ip === current.ip) < 0) riskLevel++;

          // has the user logged in with this browser before?
          if (history.findIndex((x) => x.browser === current.browser) < 0)
            riskLevel++;

          // if this is a third device, set the maximum risk level
          const devices = history.filter(
            (x) => x.device !== current.device,
          )?.length;
          if (devices > 1) riskLevel++;
        }

        let time: Date | string | string[] = new Date(current.time)
          .toISOString()
          .split("T");
        time = `${time[0]} ${time[1].split(".")[0]}`;

        return {
          flag: flag,
          level: riskLevel,
          time: time,
        };
      },
    },
  };
}
// import BaseModel from "../BaseModel";
// import { ILoginDocument } from "./ILogin";
//
// export class Login extends BaseModel<ILoginDocument> {
//   constructor() {
//     super(
//       {
//         id: { type: String, required: true, unique: true },
//         user_id: { type: String, required: true },
//         ip: { type: String, required: true },
//         time: { type: Date, required: true },
//         browser: { type: String },
//         device: { type: String },
//       },
//       "Login",
//     );
//   }
// }
// // import { v4 as uuidv4 } from "uuid";
// // import mongoose, { Model, Schema } from "mongoose";
// // import { LoginDocument } from "../types/model";
// //
// // const LoginSchema = new Schema<LoginDocument>({
// // });
// //
// // const Login: Model<LoginDocument> = mongoose.model(
// //   "Login",
// //   LoginSchema,
// //   "login",
// // );
// //
// // export const schema = Login;
// //
// // /* login.create()
// //  * store a new user login
// //  */
// //
// // export const create = async function ({
// //   user,
// //   req,
// // }: {
// //   user: string;
// //   req: any;
// // }) {
// //   // get ip address
// //   const ip =
// //     (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
// //     req.connection?.remoteAddress ||
// //     req.socket?.remoteAddress ||
// //     req.connection?.socket?.remoteAddress;
// //
// //   // get the user agent
// //   let ua, device, uarr, browser;
// //   if (process.env.NODE_ENV !== "test") {
// //     ua = req.headers["user-agent"];
// //     device =
// //       process.env.NODE_ENV === "test"
// //         ? "Test"
// //         : ua.substring(ua.indexOf("(") + 1, ua.indexOf(")")).replace(/_/g, ".");
// //     uarr = ua.split(" ");
// //     browser = uarr[uarr.length - 1];
// //   } else {
// //     (browser = "Mock"), (device = "Test");
// //   }
// //
// //   const newLogin = new Login({
// //     id: uuidv4(),
// //     user_id: user,
// //     ip: ip,
// //     time: new Date(),
// //     browser: browser,
// //     device: device,
// //   });
// //
// //   return await newLogin.save();
// // };
// //
// // /*
// //  * login.verify()
// //  * check for a suspicious login based on ip, device, or browser
// //  * notify the user when a flag has been set but continue login
// //  * the risk level increases with each flag set
// //  * if the risk level reaches 3, the login should be blocked
// //  */
// //
// // export const verify = async function ({
// //   user,
// //   current,
// // }: {
// //   user: string;
// //   current: LoginDocument;
// // }) {
// //   let riskLevel = 0;
// //
// //   const flag = {
// //     ip: current.ip,
// //     device: current.device,
// //     browser: current.browser?.split("/")[0],
// //   };
// //
// //   const history = await Login.find({ user_id: user, id: { $ne: current.id } })
// //     // .select() TODO: Fix what it should select... Srsly, who did this?
// //     .limit(500);
// //
// //   // if this isn't the user's first login: perform security checks
// //   if (history.length) {
// //     // has the user logged in from this IP address before?
// //     if (history.findIndex((x) => x.ip === current.ip) < 0) riskLevel++;
// //
// //     // has the user logged in with this browser before?
// //     if (history.findIndex((x) => x.browser === current.browser) < 0)
// //       riskLevel++;
// //
// //     // if this is a third device, set the maximum risk level
// //     const devices = history.filter((x) => x.device !== current.device)?.length;
// //     if (devices > 1) riskLevel++;
// //   }
// //
// //   let time: Date | string | string[] = new Date(current.time)
// //     .toISOString()
// //     .split("T");
// //   time = `${time[0]} ${time[1].split(".")[0]}`;
// //
// //   return {
// //     flag: flag,
// //     level: riskLevel,
// //     time: time,
// //   };
// // };
