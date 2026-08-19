import { describe, expect, it, vi } from "vitest";

const { createPartnershipInquiry, notifyOwner } = vi.hoisted(() => ({
  createPartnershipInquiry: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("./db", () => ({ createPartnershipInquiry }));
vi.mock("./_core/notification", () => ({ notifyOwner }));

import { buildPartnershipNotification, partnershipInput, partnershipsRouter } from "./routers/partnerships";

const input = {
  name: "Lia Duarte",
  email: "lia@exemplo.com",
  organization: "Sinal Coletivo",
  interest: "pesquisa" as const,
  message: "Queremos conversar sobre uma ferramenta para leitura de dados culturais.",
};

describe("partnership inquiry", () => {
  it("valida o contato e produz um alerta in-app acionável para o proprietário", () => {
    const parsed = partnershipInput.parse(input);
    const notification = buildPartnershipNotification(parsed);

    expect(notification.title).toContain("pesquisa");
    expect(notification.content).toContain("lia@exemplo.com");
    expect(notification.content).toContain("Sinal Coletivo");
  });

  it("persiste o sinal e dispara uma notificação quando o envio é válido", async () => {
    createPartnershipInquiry.mockResolvedValue(undefined);
    notifyOwner.mockResolvedValue(true);
    const caller = partnershipsRouter.createCaller({} as never);

    await expect(caller.submit(input)).resolves.toEqual({ success: true });

    expect(createPartnershipInquiry).toHaveBeenCalledWith(input);
    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("pesquisa") }));
  });

  it("retorna uma mensagem pública segura quando o banco não está disponível", async () => {
    createPartnershipInquiry.mockRejectedValueOnce(new Error("Database is not available for partnership inquiries"));
    notifyOwner.mockClear();
    const caller = partnershipsRouter.createCaller({} as never);

    await expect(caller.submit(input)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message: expect.stringContaining("canal de parcerias está em pausa"),
    });

    expect(notifyOwner).not.toHaveBeenCalled();
  });
});
