import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// O Vercel pode encaminhar o caminho com ou sem o prefixo da função.
// Normalizamos antes de delegar ao middleware para manter o contrato /api/trpc/*.
app.use((req, _res, next) => {
  if (!req.url.startsWith("/api/trpc")) {
    req.url = `/api/trpc${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }
  next();
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
