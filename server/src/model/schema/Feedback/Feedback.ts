import { v4 as uuidv4 } from "uuid";
import Model from "../Model";
import { IFeedbackDocument } from "./IFeedback";

export class Feedback extends Model<IFeedbackDocument> {
  constructor() {
    super(
      {
        id: { type: String, required: true, unique: true },
        rating: { type: String, required: true },
        comment: { type: String },
        date_created: { type: Date },
        user_id: { type: String, required: true },
      },
      "Feedback",
    );
  }

  public custom = {
    create: {
      /*
       * feedback.create()
       * save a new feedback rating plus comment
       */
      create: async ({
        data,
        user,
      }: {
        data: { rating: string; comment?: string };
        user: string;
      }) => {
        const newFeedback = {
          rating: data.rating,
          comment: data.comment,
          date_created: new Date(),
          user_id: user,
        };

        return await this.create.new(newFeedback);
      },
    },
    read: {
      /*
       * feedback.get()
       * list feedback items
       */
      get: async (id: string | null = null) => {
        const data = await this.model.aggregate([
          {
            $project: {
              id: id || null,
              rating: 1,
              user_id: 1,
              comment: { $ifNull: ["$comment", null] },
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "user_id",
              foreignField: "id",
              as: "user_data",
            },
          },
        ]);

        return data.map((f) => {
          return {
            id: f.id,
            user_id: f.user_id,
            comment: f.comment,
            email: f.user_data.find((x) => x.id === f.user_id)?.email,
          };
        });
      },

      /*
       * feedback.metrics()
       * sum ratings by group
       */
      metrics: async () => {
        const data = await this.model.aggregate([
          {
            $group: {
              _id: "$rating",
              total: { $sum: 1 },
            },
          },
        ]);

        const res: Record<string, number> = {};
        data.forEach((x) => {
          res[x._id] = x.total;
        });
        return res;
      },
    },
    update: {},
    delete: {
      /*
       * feedback.delete()
       * delete a feedback item
       */
      deleteFeedback: async (id: string) => {
        return await this.model.deleteOne({ id: id });
      },
    },
  };
}

// import BaseModel from "../BaseModel";
// import { IFeedbackDocument } from "./IFeedback";
//
// export class Feedback extends BaseModel<IFeedbackDocument> {
//   constructor() {
//     super(
//       {
//         id: { type: String, required: true, unique: true },
//         rating: { type: String, required: true },
//         comment: { type: String },
//         date_created: { type: Date },
//         user_id: { type: String, required: true },
//       },
//       "Feedback",
//     );
//   }
// }
//
// // /*
// //  * feedback.create()
// //  * save a new feedback rating plus comment
// //  */
// //
// // export const create = async function ({
// //   data,
// //   user,
// // }: {
// //   data: { rating: string; comment?: string };
// //   user: string;
// // }) {
// //   const newFeedback = new Feedback({
// //     id: uuidv4(),
// //     rating: data.rating,
// //     comment: data.comment,
// //     date_created: new Date(),
// //     user_id: user,
// //   });
// //
// //   return await newFeedback.save();
// // };
// //
// // /*
// //  * feedback.get()
// //  * list feedback items
// //  */
// //
// // export const get = async function (id: string | null = null) {
// //   const data = await Feedback.aggregate([
// //     {
// //       $project: {
// //         id: id || null,
// //         rating: 1,
// //         user_id: 1,
// //         comment: { $ifNull: ["$comment", null] },
// //       },
// //     },
// //     {
// //       $lookup: {
// //         from: "user",
// //         localField: "user_id",
// //         foreignField: "id",
// //         as: "user_data",
// //       },
// //     },
// //   ]);
// //
// //   return data.map((f) => {
// //     return {
// //       id: f.id,
// //       user_id: f.user_id,
// //       comment: f.comment,
// //       email: f.user_data.find((x) => x.id === f.user_id)?.email,
// //     };
// //   });
// // };
// //
// // /*
// //  * feedback.metrics()
// //  * sum ratings by group
// //  */
// //
// // export const metrics = async function () {
// //   const data = await Feedback.aggregate([
// //     {
// //       $group: {
// //         _id: "$rating",
// //         total: { $sum: 1 },
// //       },
// //     },
// //   ]);
// //
// //   const res: Record<string, number> = {};
// //   data.forEach((x) => {
// //     res[x._id] = x.total;
// //   });
// //   return res;
// // };
// //
// // /*
// //  * feedback.delete()
// //  * delete a feedback item
// //  */
// //
// // export const deleteFeedback = async function (id: string) {
// //   return await Feedback.deleteOne({ id: id });
// // };
