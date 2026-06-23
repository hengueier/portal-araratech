import React, { Fragment } from "react";
import { Card, Table, useAPI, Message } from "@/components/lib";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR");
}

const TABLE_HEADER = [
  { name: "owner_name", title: "Nome", sort: true },
  { name: "owner_email", title: "E-mail", sort: true },
  { name: "account_name", title: "Conta", sort: true },
  { name: "plan", title: "Plano", sort: true },
  { name: "plan_active", title: "Status", sort: true },
  { name: "date_created", title: "Cadastro", sort: true },
];

export function Sales() {
  const accounts = useAPI("/api/sales/accounts");

  const rows =
    accounts.data?.map((account) => ({
      id: account.account_id,
      owner_name: account.owner_name,
      owner_email: account.owner_email,
      account_name: account.account_name,
      plan: account.plan,
      plan_active: account.plan_active ? "Ativo" : "Inativo",
      date_created: formatDate(account.date_created),
    })) ?? [];

  (rows as typeof rows & { header?: typeof TABLE_HEADER }).header =
    TABLE_HEADER;

  return (
    <Fragment>
      <Message
        title="Clientes"
        type="info"
        text="Lista de titulares de conta e seus planos. Os dados refletem o cadastro no banco de dados."
      />

      <Card title="Vendas" restrictWidth>
        <Table
          search
          loading={accounts.loading}
          data={rows}
          badge={{
            col: "plan",
            color: "blue",
          }}
          show={[
            "owner_name",
            "owner_email",
            "account_name",
            "plan",
            "plan_active",
            "date_created",
          ]}
        />
      </Card>
    </Fragment>
  );
}
