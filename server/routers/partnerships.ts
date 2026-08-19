import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createPartnershipInquiry } from "../db.js";
import { notifyOwner } from "../_core/notification.js";
import { publicProcedure, router } from "../_core/trpc.js";

export const partnershipInput = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(320),
  organization: z.string().trim().max(160).optional(),
  interest: z.enum(["tecnologia", "cultura", "pesquisa", "outro"]),
  message: z.string().trim().min(12, "Conte um pouco mais sobre a ideia.").max(2400),
});

export type PartnershipInput = z.infer<typeof partnershipInput>;

export function buildPartnershipNotification(input: PartnershipInput) {
  const organization = input.organization ? `\nOrganização: ${input.organization}` : "";
  return {
    title: `Novo sinal de parceria — ${input.interest}`,
    content: `Nome: ${input.name}\nE-mail: ${input.email}${organization}\nÁrea: ${input.interest}\n\nMensagem:\n${input.message}`,
  };
}

export const partnershipsRouter = router({
  submit: publicProcedure.input(partnershipInput).mutation(async ({ input }) => {
    await createPartnershipInquiry(input);

    const notified = await notifyOwner(buildPartnershipNotification(input));
    if (!notified) {
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: "Seu sinal foi registrado, mas o canal do Studio está indisponível. Tente enviar novamente em alguns instantes.",
      });
    }

    return { success: true } as const;
  }),
});
