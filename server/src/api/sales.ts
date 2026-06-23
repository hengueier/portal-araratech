import express from "express";
import * as auth from "../model/lib/Auth/Auth";
import salesController from "@/controller/Sales/SalesController";
import { use } from "../helper/utility";
import track from "../helper/track";

const api = express.Router();

api.get(
  "/api/sales/accounts",
  auth.verify("sales"),
  track,
  use(salesController.list),
);

export default api;
