import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm.js";
import { publicProcedure, router } from "../_core/trpc.js";

const webKlipInput = z.object({
  query: z.string().trim().min(2, "Escreva uma pergunta um pouco mais específica.").max(320),
});

const intelligenceShape = z.object({
  title: z.string().min(1).max(90),
  insight: z.string().min(1).max(700),
  angles: z.array(z.string().min(1).max(130)).min(3).max(3),
  signal: z.string().min(1).max(130),
});

export type WebKlipIntelligence = z.infer<typeof intelligenceShape>;

export function buildResearchRoutes(query: string) {
  const encoded = encodeURIComponent(query);
  return [
    {
      title: "Panorama aberto",
      source: "Google",
      description: "Mapeie a conversa pública e compare perspectivas.",
      url: `https://www.google.com/search?q=${encoded}`,
    },
    {
      title: "Código em movimento",
      source: "GitHub",
      description: "Veja projetos, discussões e implementações relacionadas.",
      url: `https://github.com/search?q=${encoded}&type=repositories`,
    },
    {
      title: "Base de contexto",
      source: "Wikipedia",
      description: "Comece por uma camada de referências e definições públicas.",
      url: `https://pt.wikipedia.org/w/index.php?search=${encoded}`,
    },
    {
      title: "Pesquisa em vídeo",
      source: "YouTube",
      description: "Observe explicações, demos e conversas recentes sobre o tema.",
      url: `https://www.youtube.com/results?search_query=${encoded}`,
    },
  ];
}

export async function getWebKlipIntelligence(query: string): Promise<WebKlipIntelligence> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é o motor editorial do Web.Klip, uma camada brasileira de pesquisa da Klipza. Responda em português brasileiro com clareza, curiosidade e precisão. Produza uma leitura inicial da pergunta, sem fingir que fez uma busca na web em tempo real e sem inventar dados, autores, fontes ou estatísticas. Evite conteúdo que envolva fraude, malware, pirataria, ativadores, crack, assédio ou material sexual explícito. A síntese deve apontar o que é útil investigar, não apresentar certeza onde há hipótese.",
        },
        {
          role: "user",
          content: `Pergunta do visitante: ${query}`,
        },
      ],
      max_tokens: 650,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "webklip_intelligence",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              insight: { type: "string" },
              angles: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
              signal: { type: "string" },
            },
            required: ["title", "insight", "angles", "signal"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string") {
      throw new Error("A IA não retornou conteúdo utilizável.");
    }

    return intelligenceShape.parse(JSON.parse(rawContent));
  } catch (error) {
    console.error("[WebKlip] Failed to generate intelligence:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "O motor de leitura está indisponível agora. Tente novamente em alguns instantes.",
    });
  }
}

export const webKlipRouter = router({
  search: publicProcedure.input(webKlipInput).mutation(async ({ input }) => {
    const intelligence = await getWebKlipIntelligence(input.query);
    return {
      query: input.query,
      intelligence,
      routes: buildResearchRoutes(input.query),
    };
  }),
});
