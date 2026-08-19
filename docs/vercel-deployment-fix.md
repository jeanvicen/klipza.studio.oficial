# Diagnóstico de deploy no Vercel

## Sintoma confirmado

O domínio `https://klipzastudiooficial.vercel.app/` estava entregando o conteúdo textual de `dist/index.js`, o bundle do servidor, em vez de `dist/public/index.html`, o build do cliente. A causa é a ausência de uma configuração de output e de uma entrada serverless adequada para a combinação atual de Vite e Express.

## Decisão de correção

O Vite continuará gerando o cliente em `dist/public`. O Vercel receberá `dist/public` como diretório estático e uma entrada Express exportada como função para rotas `/api/*`. As regras de rewrite reservarão `/api/*` para a função e servirão `index.html` para as rotas restantes da SPA.

## Estado da validação externa

O commit de correção foi enviado ao branch `main`, que é a origem mostrada no deploy. A primeira consulta ao domínio ainda respondeu com o artefato anterior, o que pode ocorrer enquanto o novo deploy é processado. O painel do Vercel requer uma sessão autenticada neste ambiente, portanto o status detalhado de build não pôde ser consultado diretamente.

Após a propagação, a página inicial passou a servir o `index.html` da Klipza Studio corretamente. A rota isolada `GET /api/health` também retornou `200`, confirmando que o runtime serverless está ativo. A entrada Express principal ainda requer investigação: `GET /api` retorna `FUNCTION_INVOCATION_FAILED` e a rota tRPC dinâmica responde `404`. Os detalhes dos runtime logs do Vercel continuam indisponíveis sem a sessão autenticada do proprietário.

Para manter as funções de produto desacopladas das integrações de OAuth e storage do ambiente Manus, a entrada final do Vercel atende o tRPC diretamente em `api/trpc/[...path].ts`. Isso preserva Web.Klip e o formulário de parcerias, que são os fluxos dinâmicos públicos do Studio.

## Integrações adiadas

O projeto no Vercel não possui variáveis de ambiente no momento. A função tRPC está carregando sem a falha de runtime anterior e retorna uma mensagem segura quando uma integração não está disponível. A ativação completa ficará para uma etapa posterior, quando houver as credenciais apropriadas no painel do Vercel.

| Recurso | Variável necessária | Estado atual |
| --- | --- | --- |
| Síntese inteligente do Web.Klip | `GEMINI_API_KEY` após adaptação do provedor de IA | Adiada por decisão do proprietário |
| Contatos e notificação de parcerias | `DATABASE_URL` e as credenciais do canal de notificação | Adiada por decisão do proprietário |

Enquanto essas variáveis não existirem, o Web.Klip responde que o motor de leitura está indisponível e o formulário informa que o canal de parcerias está em pausa. Nenhuma mensagem é persistida e nenhuma notificação é disparada nesse estado.

## Referências oficiais

1. [Express on Vercel](https://vercel.com/docs/frameworks/backend/express) — o aplicativo Express deve ser exportado como padrão ou iniciado em uma entrada reconhecida; assets estáticos devem ser servidos pelo diretório público do Vercel.
2. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) — para SPAs Vite, um rewrite para `index.html` permite deep links.
3. [Rewrites on Vercel](https://vercel.com/docs/routing/rewrites) — rewrites diferenciam caminhos de API e páginas dentro do mesmo projeto.
