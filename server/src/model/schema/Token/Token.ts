import Cryptr from "cryptr";
import Model from "../Model";
import { ITokenDocument } from "./IToken";

const crypto = new Cryptr(process.env.CRYPTO_SECRET);

export class Token extends Model<ITokenDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        provider: { type: String, required: true },
        jwt: { type: String },
        access: { type: String },
        refresh: { type: String },
        user_id: { type: String, required: true },
      },
      "Token",
    );
  }

  public custom = {
    save: {
      /*
       * token.save()
       * create new or update an existing token
       */
      save: async ({
        provider,
        data,
        user,
      }: {
        provider: string;
        data: any;
        user: string;
      }) => {
        if (data.access) data.access = crypto.encrypt(data.access);

        if (data.refresh) data.refresh = crypto.encrypt(data.refresh);

        const tokenData = await this.model.findOne({
          provider: provider,
          user_id: user,
        });

        if (tokenData) {
          await this.model.findOneAndUpdate(
            { id: tokenData.id, user_id: user },
            data,
          );
        } else {
          const newToken = {
            provider: provider,
            jwt: data.jwt,
            access: data.access,
            refresh: data.refresh,
            user_id: user,
          };

          this.create.new(newToken);
        }

        return data;
      },
    },
    get: {
      /*
       * token.get()
       * return the token for the new user
       */
      get: async ({
        id,
        provider,
        user,
        skipDecryption,
      }: {
        id?: string;
        provider?: string;
        user: string;
        skipDecryption?: boolean;
      }) => {
        const data = await this.model.find({
          user_id: user,
          ...(id && { id: id }),
          ...(provider && { provider: provider }),
        });

        if (data.length && !skipDecryption) {
          data.forEach((token) => {
            if (token.access) token.access = crypto.decrypt(token.access);

            if (token.refresh) token.refresh = crypto.decrypt(token.refresh);
          });
        }

        return data;
      },
    },
    verify: {
      /*
       * token.verify()
       * check if a token is present for provider/user
       */
      verify: async ({
        provider,
        user,
      }: {
        provider: string;
        user: string;
      }) => {
        const data = await this.model.find({
          user_id: user,
          provider: provider,
        });
        return data.length ? true : false;
      },
    },
    delete: {
      /*
       * token.delete()
       * delete a token
       */
      token: async ({
        id,
        provider,
        user,
      }: {
        id?: string;
        provider?: string;
        user: string;
      }) => {
        return await this.model.deleteOne({
          user_id: user,
          ...(provider && { provider: provider }),
          ...(id && { id: id }),
        });
      },
    },
  };
}
// import BaseModel from "../BaseModel";
// import { ITokenDocument } from "./IToken";
//
// export class Token extends BaseModel<ITokenDocument> {
//   constructor() {
//     super(
//       {
//         id: { type: String, required: true, unique: true },
//         provider: { type: String, required: true },
//         jwt: { type: String },
//         access: { type: String },
//         refresh: { type: String },
//         user_id: { type: String, required: true },
//       },
//       "Token",
//     );
//   }
// }
// // import mongoose, { Schema, Model } from "mongoose";
// // import Cryptr from "cryptr";
// // import { v4 as uuidv4 } from "uuid";
// // import { TokenDocument } from "../types/model";
// //
// // const crypto = new Cryptr(process.env.CRYPTO_SECRET);
// //
// // const TokenSchema = new Schema<TokenDocument>({
// //   id: { type: String, required: true, unique: true },
// //   provider: { type: String, required: true },
// //   jwt: { type: String },
// //   access: { type: String },
// //   refresh: { type: String },
// //   user_id: { type: String, required: true },
// // });
// //
// // const Token: Model<TokenDocument> = mongoose.model(
// //   "Token",
// //   TokenSchema,
// //   "token",
// // );
// //
// // /*
// //  * token.save()
// //  * create new or update an existing token
// //  */
// //
// // export const save = async function ({
// //   provider,
// //   data,
// //   user,
// // }: {
// //   provider: string;
// //   data: any;
// //   user: string;
// // }) {
// //   if (data.access) data.access = crypto.encrypt(data.access);
// //
// //   if (data.refresh) data.refresh = crypto.encrypt(data.refresh);
// //
// //   const tokenData = await Token.findOne({ provider: provider, user_id: user });
// //
// //   if (tokenData) {
// //     await Token.findOneAndUpdate({ id: tokenData.id, user_id: user }, data);
// //   } else {
// //     const newToken = new Token({
// //       id: uuidv4(),
// //       provider: provider,
// //       jwt: data.jwt,
// //       access: data.access,
// //       refresh: data.refresh,
// //       user_id: user,
// //     });
// //
// //     await newToken.save();
// //   }
// //
// //   return data;
// // };
// //
// // /*
// //  * token.get()
// //  * return the token for the new user
// //  */
// //
// // export const get = async function ({
// //   id,
// //   provider,
// //   user,
// //   skipDecryption,
// // }: {
// //   id?: string;
// //   provider?: string;
// //   user: string;
// //   skipDecryption?: boolean;
// // }) {
// //   const data = await Token.find({
// //     user_id: user,
// //     ...(id && { id: id }),
// //     ...(provider && { provider: provider }),
// //   });
// //
// //   if (data.length && !skipDecryption) {
// //     data.forEach((token) => {
// //       if (token.access) token.access = crypto.decrypt(token.access);
// //
// //       if (token.refresh) token.refresh = crypto.decrypt(token.refresh);
// //     });
// //   }
// //
// //   return data;
// // };
// //
// // /*
// //  * token.verify()
// //  * check if a token is present for provider/user
// //  */
// //
// // export const verify = async function ({
// //   provider,
// //   user,
// // }: {
// //   provider: string;
// //   user: string;
// // }) {
// //   const data = await Token.find({ user_id: user, provider: provider });
// //   return data.length ? true : false;
// // };
// //
// // /*
// //  * token.delete()
// //  * delete a token
// //  */
// //
// // export const deleteToken = async function ({
// //   id,
// //   provider,
// //   user,
// // }: {
// //   id?: string;
// //   provider?: string;
// //   user: string;
// // }) {
// //   return await Token.deleteOne({
// //     user_id: user,
// //     ...(provider && { provider: provider }),
// //     ...(id && { id: id }),
// //   });
// // };
