# Portal AraraTech → Arara Platform

App slug: `portal-araratech` (registrado na platform; sem dump no Hostinger-Suporte nesta onda).

```bash
# platform/
npx tsx scripts/integrate-app.ts --slug portal-araratech --name "Portal AraraTech" --schema-only
```

Auth unificado: `POST http://localhost:4100/v1/auth/login` (ver `platform/data/UNIFIED-AUTH.md`).
Mint key: `POST /v1/apps/portal-araratech/keys`.
Runtime: `/v1/r/portal-araratech/*`.

Quando houver dump de produção, colocar JSON em `platform/data/portal-araratech-prod/` e re-rodar integrate sem `--schema-only`.
