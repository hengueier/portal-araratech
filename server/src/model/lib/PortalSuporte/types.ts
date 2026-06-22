export interface ExternalTicketListFilters {
  company_cnpj?: string;
  contact_email?: string;
  company_name?: string;
  status?: string;
  priority?: string;
  severity?: string;
  created_after?: string;
  created_before?: string;
  page?: number;
  page_size?: number;
}

export interface ExternalTicketSummary {
  id: string;
  title: string;
  status: string;
  status_label: string;
  priority: string;
  severity: string | null;
  company_name: string | null;
  company_cnpj: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
  sla_deadline: string | null;
  sla_breached: boolean;
}

export interface ExternalTicketAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

export interface ExternalTicketDetail extends ExternalTicketSummary {
  description: string;
  ticket_number: string | null;
  attachments: ExternalTicketAttachment[];
  messages_url: string;
}

export interface PaginatedTickets {
  data: ExternalTicketSummary[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export class PortalSuporteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
