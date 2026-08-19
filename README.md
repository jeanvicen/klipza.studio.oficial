# Klipza Studio — Site oficial

Este repositório contém a experiência institucional da **Klipza Studio**: uma narrativa digital cinematográfica que apresenta a Klipza.ia, demonstra o Web.Klip e abre um canal operacional de parcerias.

## O que está implementado

| Área | Entrega |
| --- | --- |
| Identidade | Hero cinematográfico, navegação flutuante, tipografia editorial, sinal de scroll, cursor contextual e símbolo original da Klipza.ia. |
| Klipza.ia | Apresentação do produto com captura real da interface e download direto pelo repositório oficial. |
| Web.Klip | Busca pública potencializada por LLM, com síntese estruturada, próximos ângulos de pesquisa e rotas transparentes para fontes públicas. |
| Parcerias | Formulário público validado, persistência em banco e notificação in-app automática ao proprietário. |
| Acessibilidade | Landmarks semânticos, nomes acessíveis, foco visível, alto contraste dos pares primários e resposta funcional a `prefers-reduced-motion`. |

## Arquitetura

O projeto usa React, Vite, Express, tRPC, Drizzle e MySQL/TiDB. O Web.Klip é chamado exclusivamente pelo servidor por meio do helper de IA da plataforma; nenhuma chave é exposta ao navegador. O formulário de parcerias grava dados estruturados na tabela `partnershipInquiries` e aciona o canal in-app do proprietário.

## Desenvolvimento

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

## Validação executada

Os testes cobrem a resposta estruturada e a falha segura do Web.Klip, a mutation pública de busca, a persistência/notificação de parcerias, a sessão de autenticação e uma linha de base de acessibilidade com renderização DOM, foco de teclado, landmarks, contraste e redução de movimento.

## Fontes e ativos

O repositório `jeanvicen/klipza.zzz` foi utilizado apenas como referência e não foi alterado. O símbolo original e a captura de produto foram servidos pelo armazenamento do projeto; a auditoria e as decisões de experiência estão registradas em `docs/reference-audit.md` e `docs/experience-blueprint.md`.

## Limites de conteúdo

O Web.Klip não apresenta uma síntese de IA como busca factual em tempo real. Ele declara a leitura como orientação editorial e oferece rotas de pesquisa explícitas para que a pessoa aprofunde o tema em fontes públicas.
