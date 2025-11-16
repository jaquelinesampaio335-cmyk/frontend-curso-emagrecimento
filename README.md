Frontend pronto para Netlify
---------------------------

1) Abra js/app.js e substitua a constante API_BASE pela URL do seu backend Render:
   const API_BASE = 'https://seu-backend.onrender.com'

2) Teste local (opcional):
   - Você pode rodar um servidor local simples (ex: `npx http-server .` dentro da pasta) para testar.
   - O backend deve responder em /api/modulos e /api/auth/login /api/auth/register

3) Deploy Netlify:
   - Faça upload da PASTA inteira do frontend no Netlify (deploy manual) ou conecte ao GitHub.
   - Se usar GitHub, crie repositório e envie todos os arquivos do frontend.

4) Observações:
   - Autenticação e liberação de módulos dependem do backend. Garanta que API_BASE esteja correto.
   - Vídeos fictícios são usados como placeholders; substitua video_url no backend quando desejar.
