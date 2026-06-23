import { Request, Response } from "express";
import Controller from "../Controller";
import Database from "@/model/Database";

class SalesController extends Controller {
  public list = async (_req: Request, res: Response) => {
    try {
      const data = await Database.Account.custom.read.listOwners();
      return this.sendSuccess(res, data);
    } catch (error) {
      return this.sendError(res, "Failed to load sales accounts", 500);
    }
  };
}

export default new SalesController();
