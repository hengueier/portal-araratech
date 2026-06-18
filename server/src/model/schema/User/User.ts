import bcrypt from "bcrypt";
import Cryptr from "cryptr";
import Model from "../Model";
import { IUserDocument, IUser } from "./IUser";
import { escapeRegex } from "@/helper/utility";

const crypto = new Cryptr(process.env.CRYPTO_SECRET);

export class User extends Model<IUserDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String },
        date_created: Date,
        last_active: Date,
        disabled: { type: Boolean },
        support_enabled: { type: Boolean, required: true },
        "2fa_enabled": { type: Boolean, required: true },
        "2fa_secret": { type: String },
        "2fa_backup_code": { type: String },
        default_account: { type: String, required: true },
        facebook_id: { type: String },
        twitter_id: { type: String },
        account: { type: Array },
        push_token: { type: String },
      },
      "User",
    );
  }

  public custom = {
    create: {
      /*
       * user.create()
       * create a new user
       */
      create: async ({ user, account }: { user: any; account: string }) => {
        const data: Omit<IUser, "id"> = {
          name: user.name,
          email: user.email,
          date_created: new Date(),
          last_active: new Date(),
          support_enabled: false,
          "2fa_enabled": false,
          facebook_id: user.facebook_id,
          twitter_id: user.twitter_id,
          default_account: account,
          has_password: null,
          account_id: null,
        };

        // encrypt password
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          data.password = await bcrypt.hash(user.password, salt);
        }

        const newUser = await this.create.new(data);

        if (newUser.password) {
          delete newUser.password;
          newUser.has_password = true;
        }

        newUser.account_id = account;
        console.log(newUser);
        return newUser;
      },
    },
    read: {
      /*
       * user.get()
       * get a user by email or user id
       */
      get: async ({
        id,
        email,
        account,
        social,
        permission,
      }: {
        id?: string;
        email?: string;
        account?: string;
        social?: any;
        permission?: string;
      }) => {
        let data;
        const cond: any = {
          ...(account && { "account.id": account }),
          ...(permission && { "account.permission": permission }),
        };

        if (social) {
          cond[`${social.provider}_id`] = social.id;
          data = await this.model
            .find({
              $or: [
                { email: { $regex: new RegExp(escapeRegex(email), "i") } },
                cond,
              ],
            })
            .lean();
        } else {
          data = await this.model
            .find({
              ...cond,
              ...{
                ...(id && { id: id }),
                ...(email && {
                  email: { $regex: new RegExp(escapeRegex(email), "i") },
                }),
              },
            })
            .lean();
        }

        if (data?.length) {
          data.forEach((u) => {
            u.account_id = account || u.default_account;
            const a = u.account.find((x) => x.id === u.account_id);
            u.permission = a.permission;
            u.onboarded = a.onboarded;
            u.has_password = u.password ? true : false;
            delete u.password;
            delete u.account;
          });
        }

        return id || email || social ? data[0] : data;
      },
    },
    account: {
      /*
       * user.account()
       * get a list of accounts this user is attached to
       */
      get: async ({ id }: { id: string; permission?: string }) => {
        const data = await this.model.aggregate([
          { $match: { id: id } },
          { $project: { id: 1, account: 1, email: 1 } },
          {
            $lookup: {
              from: "account",
              localField: "account.id",
              foreignField: "id",
              as: "account_data",
            },
          },
        ]);

        return data[0]?.account.map((a) => {
          return {
            id: a.id,
            user_id: data[0].id,
            permission: a.permission,
            name: data[0].account_data.find((x) => x.id === a.id)?.name,
          };
        });
      },

      /*
       * user.account.add()
       * assign a user to an account
       */
      add: async ({
        id,
        account,
        permission,
      }: {
        id: string;
        account: string;
        permission: string;
      }) => {
        const data = await this.model.findOne({ id: id });

        if (data) {
          data.account.push({
            id: account,
            permission: permission,
            onboarded: false,
          });
          data.markModified("account");
          return await data.save();
        }

        throw { message: `No user with that ID` };
      },

      /*
       * user.account.delete()
       * remove a user from an account
       */
      delete: async ({ id, account }: { id: string; account: string }) => {
        const data = await this.model.findOne({ id: id });

        if (data) {
          data.account.splice(
            data.account.findIndex((x) => x.id === account),
            1,
          );
          data.markModified("account");
          return await data.save();
        }

        throw { message: `No user with that ID` };
      },
    },
    password: {
      /*
       * user.password()
       * return the user hash
       */
      password: async ({ id, account }: { id: string; account: string }) => {
        return await this.model
          .findOne({ id: id, "account.id": account })
          .select({
            password: 1,
          });
      },

      /*
       * user.password.verify()
       * check the password against the hash stored in the database
       */
      verify: async ({
        id,
        account,
        password,
      }: {
        id: string;
        account: string;
        password: string;
      }) => {
        const data = await this.model
          .findOne({
            id: id,
            "account.id": account,
          })
          .select({
            name: 1,
            email: 1,
            password: 1,
          });

        const verified = data?.password
          ? await bcrypt.compare(password, data.password)
          : false;

        delete data.password;
        return verified ? data : false;
      },

      /*
       * user.password.save()
       * save a new password for the user
       * if not executed via a password reset request, the user is notified
       * by email that their password has been changed
       * passwordReset: true/false to determine of password update is part of reset
       */
      save: async ({ id, password }: { id: string; password: string }) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return await this.model.findOneAndUpdate(
          { id: id },
          { password: hash },
        );
      },
    },
    update: {
      /*
       * user.update()
       * update the user profile
       * profile: object containing the user data to be saved
       */
      update: async ({
        id,
        account,
        data,
      }: {
        id: string;
        account: string;
        data: any;
      }) => {
        if (data.onboarded || data.permission) {
          const doc = await this.model.findOne({
            id: id,
            "account.id": account,
          });
          if (!doc) throw { message: `No user with that ID` };

          const index = doc.account.findIndex((x) => x.id === account);

          if (data.onboarded) doc.account[index].onboarded = data.onboarded;

          if (data.permission) doc.account[index].permission = data.permission;

          doc.markModified("account");
          doc.save();
        } else {
          await this.model.findOneAndUpdate(
            { id: id, "account.id": account },
            data,
          );
        }

        return data;
      },
    },
    deleteUser: {
      /*
       * user.delete()
       * delete the user
       */
      deleteUser: async ({ id, account }: { id: string; account: string }) => {
        return await this.model.deleteMany({
          ...(id && { id: id }),
          "account.id": account,
        });
      },
    },
    twoFactorSecret: {
      /*
       * user.2fa.secret()
       * return the decrypted 2fa secret
       */
      twoFactorSecret: async ({
        id,
        email,
      }: {
        id?: string;
        email?: string;
      }) => {
        const data = await this.model
          .findOne({
            ...(id && { id: id }),
            ...(email && { email: email }),
          })
          .select({ "2fa_secret": 1 });

        return data ? crypto.decrypt(data["2fa_secret"]) : null;
      },
    },
    twoFactorBackup: {
      /*
       * user.2fa.backup.save()
       * hash and save the users backup code
       */
      save: async ({ id, code }: { id: string; code: string }) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(code, salt);
        return await this.model.findOneAndUpdate(
          { id: id },
          { "2fa_backup_code": hash },
        );
      },

      /*
       * user.2fa.backup.verify()
       * verify the users 2fa backup code
       */
      verify: async ({
        id,
        email,
        account,
        code,
      }: {
        id?: string;
        email?: string;
        account?: string;
        code: string;
      }) => {
        const data = await this.model
          .findOne({
            ...(id && { id: id, "account.id": account }),
            ...(email && { email: email }),
          })
          .select({ "2fa_backup_code": 1 });

        return data?.["2fa_backup_code"]
          ? await bcrypt.compare(code, data["2fa_backup_code"])
          : false;
      },
    },
  };
}
