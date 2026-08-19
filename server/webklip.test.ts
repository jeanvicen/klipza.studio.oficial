import { describe, expect, it, vi } from "vitest";

const { invokeLLM } = vi.hoisted(() => ({ invokeLLM: vi.fn() }));

vi.mock("./_core/llm", () => ({ invokeLLM }));

import { buildResearchRoutes, getWebKlipIntelligence, webKlipRouter } from "./routers/webklip";

describe("Web.Klip research routes", () => {
  it("cria caminhos públicos e codificados para uma consulta", () => {
    const routes = buildResearchRoutes("design de IA & interfaces");

    expect(routes).toHaveLength(4);
    expect(routes.map((route) => route.source)).toEqual(["Google", "GitHub", "Wikipedia", "YouTube"]);
    expect(routes.every((route) => route.url.startsWith("https://"))).toBe(true);
    expect(routes[0]?.url).toContain("design%20de%20IA%20%26%20interfaces");
  });
});

describe("Web.Klip intelligence", () => {
  it("retorna uma leitura estruturada quando a IA responde dentro do contrato", async () => {
    invokeLLM.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            title: "Interfaces que aprendem com o uso",
            insight: "A IA muda o design quando amplia a exploração, mas exige critérios claros de utilidade e confiança.",
            angles: ["Explorar protótipos assistidos.", "Definir limites de personalização.", "Avaliar transparência e controle."],
            signal: "O designer passa a desenhar sistemas de decisão, não apenas telas.",
          }),
        },
      }],
    });

    await expect(getWebKlipIntelligence("Como a IA muda interfaces?")).resolves.toMatchObject({
      title: "Interfaces que aprendem com o uso",
      angles: expect.arrayContaining(["Explorar protótipos assistidos."]),
    });
  });

  it("falha com uma mensagem segura quando a IA não consegue responder", async () => {
    invokeLLM.mockRejectedValue(new Error("upstream unavailable"));

    await expect(getWebKlipIntelligence("O que devo pesquisar?")).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "O motor de leitura está indisponível agora. Tente novamente em alguns instantes.",
    });
  });
});

describe("Web.Klip public mutation", () => {
  it("entrega a leitura e as rotas completas ao cliente", async () => {
    invokeLLM.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            title: "Pesquisa com direção",
            insight: "Uma primeira leitura ajuda a escolher o que aprofundar antes de abrir novas abas.",
            angles: ["Mapear o contexto.", "Comparar abordagens.", "Transformar o achado em próxima ação."],
            signal: "A pergunta guia a pesquisa.",
          }),
        },
      }],
    });
    const caller = webKlipRouter.createCaller({} as never);

    await expect(caller.search({ query: "pesquisa em design" })).resolves.toMatchObject({
      query: "pesquisa em design",
      intelligence: { title: "Pesquisa com direção" },
      routes: expect.arrayContaining([expect.objectContaining({ source: "GitHub" })]),
    });
  });

  it("propaga uma falha segura quando a IA não retorna uma resposta", async () => {
    invokeLLM.mockRejectedValue(new Error("upstream unavailable"));
    const caller = webKlipRouter.createCaller({} as never);

    await expect(caller.search({ query: "pesquisa em design" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "O motor de leitura está indisponível agora. Tente novamente em alguns instantes.",
    });
  });
});
