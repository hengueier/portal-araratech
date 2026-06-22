import React, { Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Loader, useAPI, Badge, Button } from "@/components/lib";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR");
}

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const ticket = useAPI(id ? `/api/tickets/${id}` : null);

  if (ticket.loading) {
    return <Loader />;
  }

  const data = ticket.data;

  if (!data) {
    return (
      <Card title="Chamado não encontrado" restrictWidth>
        <Link to="/tickets">
          <Button text="Voltar para lista" />
        </Link>
      </Card>
    );
  }

  return (
    <Fragment>
      <div className="mb-4">
        <Link to="/tickets" className="text-sm text-indigo-600 hover:underline">
          ← Voltar para chamados
        </Link>
      </div>

      <Card title={data.title} restrictWidth>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge text={data.status_label || data.status} color="blue" />
            <Badge text={`Prioridade: ${data.priority}`} color="green" />
            {data.severity && (
              <Badge text={`Severidade: ${data.severity}`} color="orange" />
            )}
            {data.sla_breached && (
              <Badge text="SLA estourado" color="red" />
            )}
          </div>

          {data.ticket_number && (
            <p className="text-sm text-slate-500">
              Número: <strong>{data.ticket_number}</strong>
            </p>
          )}

          <div>
            <h3 className="font-semibold mb-1">Descrição</h3>
            <p className="whitespace-pre-wrap text-slate-700">{data.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {data.company_name && (
              <div>
                <span className="text-slate-500">Empresa:</span>{" "}
                {data.company_name}
              </div>
            )}
            {data.company_cnpj && (
              <div>
                <span className="text-slate-500">CNPJ:</span> {data.company_cnpj}
              </div>
            )}
            {data.contact_email && (
              <div>
                <span className="text-slate-500">Contato:</span>{" "}
                {data.contact_email}
              </div>
            )}
            <div>
              <span className="text-slate-500">Criado em:</span>{" "}
              {formatDate(data.created_at)}
            </div>
            <div>
              <span className="text-slate-500">Atualizado em:</span>{" "}
              {formatDate(data.updated_at)}
            </div>
            {data.sla_deadline && (
              <div>
                <span className="text-slate-500">Prazo SLA:</span>{" "}
                {formatDate(data.sla_deadline)}
              </div>
            )}
          </div>

          {data.attachments?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Anexos</h3>
              <ul className="space-y-2">
                {data.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {a.file_name}
                    </a>
                    {a.file_size != null && (
                      <span className="text-slate-400 text-sm ml-2">
                        ({Math.round(a.file_size / 1024)} KB)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </Fragment>
  );
}
