import type { IncomingMessage, ServerResponse } from "node:http";

/** Healthcheck independente de integrações externas para diagnóstico do runtime Vercel. */
export default function health(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: true, runtime: "vercel" }));
}
