import { Request, Response } from "express";
import Controller from "../Controller";
import PortalSuporteService from "@/model/lib/PortalSuporte/portalSuporte";
import { PortalSuporteError } from "@/model/lib/PortalSuporte/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class TicketController extends Controller {
  private service = new PortalSuporteService();

  public list = async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const pageSize = req.query.page_size
        ? Number(req.query.page_size)
        : undefined;

      const result = await this.service.list({
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        severity: req.query.severity as string | undefined,
        page: page && !Number.isNaN(page) ? page : undefined,
        page_size: pageSize && !Number.isNaN(pageSize) ? pageSize : undefined,
      });

      return this.sendSuccess(res, result);
    } catch (error) {
      return this.handlePortalSuporteError(res, error);
    }
  };

  public getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!UUID_REGEX.test(id)) {
        return this.sendError(res, "id inválido", 400);
      }

      const ticket = await this.service.getById(id);
      return this.sendSuccess(res, ticket);
    } catch (error) {
      return this.handlePortalSuporteError(res, error);
    }
  };

  private handlePortalSuporteError(res: Response, error: unknown) {
    if (error instanceof PortalSuporteError) {
      return this.sendError(res, error.message, error.status);
    }
    return this.sendError(res, "Erro ao consultar chamados", 500);
  }
}

export default new TicketController();
