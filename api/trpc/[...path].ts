import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// A função catch-all pode receber o caminho completo ou somente o trecho depois
// de /api/trpc. O adaptador do tRPC precisa receber apenas /procedimento.
app.use((req, _res, next) => {
  const trpcPrefix = "/api/trpc";
  const prefixPosition = req.url.indexOf(trpcPrefix);
  if (prefixPosition >= 0) {
    const procedurePath = req.url.slice(prefixPosition + trpcPrefix.length);
    req.url = procedurePath || "/";
  }
  next();
});

app.use(createExpressMiddleware({ router: appRouter, createContext }));

export default app;
