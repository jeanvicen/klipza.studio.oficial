# Diagnóstico de deploy no Vercel

## Sintoma confirmado

O domínio `https://klipzastudiooficial.vercel.app/` estava entregando o conteúdo textual de `dist/index.js`, o bundle do servidor, em vez de `dist/public/index.html`, o build do cliente. A causa é a ausência de uma configuração de output e de uma entrada serverless adequada para a combinação atual de Vite e Express.

## Decisão de correção

O Vite continuará gerando o cliente em `dist/public`. O Vercel receberá `dist/public` como diretório estático e uma entrada Express exportada como função para rotas `/api/*`. As regras de rewrite reservarão `/api/*` para a função e servirão `index.html` para as rotas restantes da SPA.

## Referências oficiais

1. [Express on Vercel](https://vercel.com/docs/frameworks/backend/express) — o aplicativo Express deve ser exportado como padrão ou iniciado em uma entrada reconhecida; assets estáticos devem ser servidos pelo diretório público do Vercel.
2. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) — para SPAs Vite, um rewrite para `index.html` permite deep links.
3. [Rewrites on Vercel](https://vercel.com/docs/routing/rewrites) — rewrites diferenciam caminhos de API e páginas dentro do mesmo projeto.
