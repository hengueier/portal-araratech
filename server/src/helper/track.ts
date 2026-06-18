import mongoose, { Model, Schema } from "mongoose";
import { TrackerDocument, TrackEntry } from "../types/model";
import { NextFunction, Request, Response } from "express";

/* NOTE:
 * This middleware should be as independent as possible.
 * This is the only place where this model is used, so it's
 * entirely defined here.
 * Aditional user information should be added through the
 * middleware pipeline depending on the application needs
 */

const TrackEntrySchema = new Schema<TrackEntry>({
  path: { type: String, required: true },
  permission: { type: String, required: false, default: null },
  provider: { type: String, required: false, default: null },
  created_at: { type: Date, required: true, default: Date.now },
});

const TrackerSchema = new Schema<TrackerDocument>({
  account_id: { type: String, required: true },
  user_id: { type: String, required: true, unique: true },
  track: { type: [TrackEntrySchema], default: [] },
});

const Tracker: Model<TrackerDocument> = mongoose.model(
  "Tracker",
  TrackerSchema,
  "tracker",
);

const track = async (req: Request | any, _: Response, next: NextFunction) => {
  /* NOTE:
   * If account doesn't exists there is no need to track, so we just skip it.
   * Also, this middleware is totally ignore on testing.
   * TODO:
   * Make tests work with the middleware.
   */
  if ((!req.account && !req.user) || process.env.NODE_ENV === "test") {
    next();
  } else {
    /* NOTE:
     * This collection will as the time goes by, register a considerate amount of records.
     * Each user will have it's own array registry, where we can, at will, limit this registry by
     * user.
     * To achieve this, every document is being updated with UPSERT.
     */
    try {
      await Tracker.findOneAndUpdate(
        { user_id: req.user },
        {
          account_id: req.account,
          user_id: req.user,
          $push: {
            track: {
              path: req.route.path,
              permission: req.permission,
              provider: req.provider,
              created_at: new Date(),
            },
          },
        },
        { upsert: true, new: true },
      );
      next();
    } catch (e) {
      /* NOTE:
       * Note that the catch will just keep the application running without breaking anything,
       * displaying as silent as possible the error for the devs, not the user.
       */
      console.error("Failed Tracking User. Skipping...", e);
      next();
    }
  }
};

export default track;
