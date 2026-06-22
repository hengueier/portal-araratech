import React, { Fragment } from "react";
import { Card, Table, useAPI, Message } from "@/components/lib";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR");
}

export function Tickets() {
  const tickets = useAPI("/api/tickets");

  const rows =
    tickets.data?.data?.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status_label || t.status,
      priority: t.priority,
      created_at: formatDate(t.created_at),
      actions: {
        view: { url: "/tickets", col: "id" },
      },
    })) ?? [];

  return (
    <Fragment>
      <Message
        title="Chamados de Suporte"
        type="info"
        text="Lista de chamados abertos no portal de suporte. Os dados são consultados em tempo real e não são armazenados localmente."
      />

      <Card title="Chamados" restrictWidth>
        <Table
          search
          loading={tickets.loading}
          data={rows}
          badge={{
            col: "status",
            color: "blue",
          }}
          show={["title", "status", "priority", "created_at", "actions"]}
        />
      </Card>

      {tickets.data?.meta && (
        <p className="text-sm text-slate-500 mt-4">
          Página {tickets.data.meta.page} de {tickets.data.meta.total_pages} —{" "}
          {tickets.data.meta.total} chamado(s)
        </p>
      )}
    </Fragment>
  );
}
