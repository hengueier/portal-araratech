import axios, { AxiosError } from "axios";
import type {
  ExternalTicketDetail,
  ExternalTicketListFilters,
  PaginatedTickets,
} from "./types";
import { PortalSuporteError } from "./types";

function getConfig() {
  const baseUrl = process.env.PORTAL_SUPORTE_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.PORTAL_SUPORTE_API_KEY;
  const companyCnpj = process.env.PORTAL_SUPORTE_COMPANY_CNPJ;
  const contactEmail = process.env.PORTAL_SUPORTE_CONTACT_EMAIL;

  if (!baseUrl || !apiKey) {
    throw new PortalSuporteError(
      "Integração com portal-suporte não configurada (PORTAL_SUPORTE_BASE_URL e PORTAL_SUPORTE_API_KEY)",
      503,
    );
  }

  if (!companyCnpj && !contactEmail) {
    throw new PortalSuporteError(
      "Filtro de cliente não configurado (PORTAL_SUPORTE_COMPANY_CNPJ ou PORTAL_SUPORTE_CONTACT_EMAIL)",
      503,
    );
  }

  return { baseUrl, apiKey, companyCnpj, contactEmail };
}

function resolveAttachmentUrls(
  ticket: ExternalTicketDetail,
  baseUrl: string,
): ExternalTicketDetail {
  return {
    ...ticket,
    attachments: ticket.attachments.map((a) => ({
      ...a,
      file_url: a.file_url.startsWith("http")
        ? a.file_url
        : `${baseUrl}${a.file_url.startsWith("/") ? "" : "/"}${a.file_url}`,
    })),
  };
}

function handleAxiosError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ error?: string }>;
    const status = axiosErr.response?.status ?? 502;
    const message =
      axiosErr.response?.data?.error ??
      axiosErr.message ??
      "Erro ao comunicar com portal-suporte";
    throw new PortalSuporteError(message, status);
  }
  throw err;
}

export default class PortalSuporteService {
  private getClient() {
    const { baseUrl, apiKey } = getConfig();
    return axios.create({
      baseURL: `${baseUrl}/api/external`,
      headers: { "x-api-key": apiKey },
      timeout: 15000,
    });
  }

  async list(filters: ExternalTicketListFilters = {}): Promise<PaginatedTickets> {
    const { companyCnpj, contactEmail } = getConfig();
    const client = this.getClient();

    const params: Record<string, string | number> = {
      ...(companyCnpj ? { company_cnpj: companyCnpj } : {}),
      ...(contactEmail ? { contact_email: contactEmail } : {}),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""),
      ),
    };

    try {
      const res = await client.get<PaginatedTickets>("/tickets", { params });
      return res.data;
    } catch (err) {
      handleAxiosError(err);
    }
  }

  async getById(id: string): Promise<ExternalTicketDetail> {
    const { baseUrl } = getConfig();
    const client = this.getClient();

    try {
      const res = await client.get<{ data: ExternalTicketDetail }>(
        `/tickets/${id}`,
      );
      return resolveAttachmentUrls(res.data.data, baseUrl);
    } catch (err) {
      handleAxiosError(err);
    }
  }
}
