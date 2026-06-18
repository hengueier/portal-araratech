import mongoose, { Collection } from "mongoose";
import * as dotenv from "dotenv";
import {
  Account,
  Event,
  Feedback,
  Invite,
  Key,
  Log,
  Login,
  Token,
  Preview,
  User,
} from "./schema";
dotenv.config();

/* NOTE:
 * This Abstract class could be a function because it uses only static methods.
 * For Readability purposes it's made that way.
 */

abstract class Database {
  private static dbUser: string = process.env.DB_USER as string;
  private static dbPassword: string = process.env.DB_PASSWORD as string;
  private static dbHost: string = process.env.DB_HOST as string;
  private static dbName: string = process.env.DB_NAME as string;

  public static async connect(): Promise<void> {
    try {
      let url: string;

      if (process.env.DOCKER === "y") {
        url =
          "mongodb://db_admin:db_admin@mongo:27017/development?authSource=admin";
      } else {
        url = `mongodb+srv://${this.dbUser}:${encodeURIComponent(
          this.dbPassword,
        )}@${this.dbHost}/${this.dbName}`;
      }

      await mongoose.connect(url);
      console.log("Connected to Mongo 👍");
    } catch (err) {
      console.error(err);
    }
  }

  public static Account = new Account();
  public static Event = new Event();
  public static Feedback = new Feedback();
  public static Invite = new Invite();
  public static Key = new Key();
  public static Log = new Log();
  public static Login = new Login();
  public static Token = new Token();
  public static Preview = new Preview();
  public static User = new User();
}

export default Database;
