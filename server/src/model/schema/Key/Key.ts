import { v4 as uuidv4 } from "uuid";
import mongoose, { Schema, Model } from "mongoose";
import * as utility from "../../../helper/utility";
import Model from "../Model";
import { IKeyDocument } from "./IKey";

export class Key extends Model<IKeyDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        name: { type: String },
        key: { type: String, required: true, unique: true },
        scope: { type: Array, required: true, default: [] },
        date_created: { type: Date, required: true },
        active: { type: Boolean, required: true },
        account_id: { type: String, required: true },
      },
      "Key",
    );
  }

  public custom = {
    create: {
      /*
       * key.create()
       * save a new api key
       */
      create: async ({
        data,
        account,
      }: {
        data: Partial<IKeyDocument> | any;
        account: string;
      }) => {
        data.active = true;
        data.account_id = account;
        data.date_created = new Date();

        const newKey = data;
        this.create.new(newKey);

        data.full_key = data.key;
        data.key = utility.mask(data.key);
        return data;
      },
    },
    read: {
      /*
       * key.get()
       * return a single or list of api keys
       */
      get: async ({
        id,
        name,
        account,
      }: {
        id?: string;
        name?: string;
        account: string;
      }) => {
        const data = await this.model.find({
          ...(id && { id: id }),
          ...(name && { name: name }),
          account_id: account,
        });

        if (data.length) {
          data.map((x) => {
            // when listing the keys mask them, reveal full keys on individual api calls
            if (!id) x.key = utility.mask(x.key);
          });
        }

        return data;
      },

      /*
       * key.unique()
       * determine if the key is unique
       */
      unique: async (key: string) => {
        const data = await this.model.find({ key: key });
        return !data.length;
      },

      /*
       * key.verify()
       * verify the api key and return the account id
       */
      verify: async (key: string) => {
        const data = await this.model
          .findOne({ key: key, active: true })
          .select({
            scope: 1,
            account_id: 1,
          });
        return data || false;
      },
    },
    update: {
      /*
       * key.revoke()
       * revoke an api key by setting the active col to false
       */
      update: async ({
        id,
        data,
        account,
      }: {
        id: string;
        data: Partial<IKeyDocument>;
        account: string;
      }) => {
        return await this.model.updateOne(
          { id: id, account_id: account },
          data,
        );
      },
    },
    delete: {
      /*
       * key.delete()
       * completely remove an api key from the database
       */
      deleteKey: async ({ id, account }: { id: string; account: string }) => {
        return await this.model.deleteOne({ id: id, account_id: account });
      },
    },
  };
}

// import BaseModel from "../BaseModel";
// import { IKeyDocument } from "./IKey";
//
// export class Key extends BaseModel<IKeyDocument> {
//   constructor() {
//     super(
//       {
//         id: { type: String, required: true, unique: true },
//         name: { type: String },
//         key: { type: String, required: true, unique: true },
//         scope: { type: Array, required: true, default: [] },
//         date_created: { type: Date, required: true },
//         active: { type: Boolean, required: true },
//         account_id: { type: String, required: true },
//       },
//       "Key",
//     );
//   }
// }
// // import { v4 as uuidv4 } from "uuid";
// // import mongoose, { Model, Schema } from "mongoose";
// // import * as utility from "../helper/utility";
// // import { KeyDocument } from "../types/model";
// //
// // const KeySchema = new Schema<KeyDocument>({
// // });
// //
// // const Key: Model<KeyDocument> = mongoose.model("Key", KeySchema, "key");
// //
// // /*
// //  * key.create()
// //  * save a new api key
// //  */
// //
// // export const create = async function ({
// //   data,
// //   account,
// // }: {
// //   data: Partial<KeyDocument> | any;
// //   account: string;
// // }) {
// //   data.id = uuidv4();
// //   data.active = true;
// //   data.account_id = account;
// //   data.date_created = new Date();
// //
// //   const newKey = new Key(data);
// //   await newKey.save();
// //
// //   data.full_key = data.key;
// //   data.key = utility.mask(data.key);
// //   return data;
// // };
// //
// // /*
// //  * key.get()
// //  * return a single or list of api keys
// //  */
// //
// // export const get = async function ({
// //   id,
// //   name,
// //   account,
// // }: {
// //   id?: string;
// //   name?: string;
// //   account: string;
// // }) {
// //   const data = await Key.find({
// //     ...(id && { id: id }),
// //     ...(name && { name: name }),
// //     account_id: account,
// //   });
// //
// //   if (data.length) {
// //     data.map((x) => {
// //       // when listing the keys mask them, reveal full keys on individual api calls
// //       if (!id) x.key = utility.mask(x.key);
// //     });
// //   }
// //
// //   return data;
// // };
// //
// // /*
// //  * key.unique()
// //  * determine if the key is unique
// //  */
// //
// // export const unique = async function (key: string) {
// //   const data = await Key.find({ key: key });
// //   return !data.length;
// // };
// //
// // /*
// //  * key.verify()
// //  * verify the api key and return the account id
// //  */
// //
// // export const verify = async function (key: string) {
// //   const data = await Key.findOne({ key: key, active: true }).select({
// //     scope: 1,
// //     account_id: 1,
// //   });
// //   return data || false;
// // };
// //
// // /*
// //  * key.revoke()
// //  * revoke an api key by setting the active col to false
// //  */
// //
// // export const update = async function ({
// //   id,
// //   data,
// //   account,
// // }: {
// //   id: string;
// //   data: Partial<KeyDocument>;
// //   account: string;
// // }) {
// //   return await Key.updateOne({ id: id, account_id: account }, data);
// // };
// //
// // /*
// //  * key.delete()
// //  * completely remove an api key from the database
// //  */
// //
// // export const deleteKey = async function ({
// //   id,
// //   account,
// // }: {
// //   id: string;
// //   account: string;
// // }) {
// //   return await Key.deleteOne({ id: id, account_id: account });
// // };
