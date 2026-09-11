# Documentação do Projeto: Gama's Burger (Cardápio Digital / Delivery)

> ⚠️ **AVISO OBRIGATÓRIO PARA A IA (ASSISTENTE DE CÓDIGO):**
> Esta documentação **DEVE SER LIDA OBRIGATORIAMENTE** por você antes de executar qualquer nova alteração solicitada pelo usuário no código.
> - Parta sempre do **estado real do projeto** documentado aqui, nunca de suposições.
> - Não altere nada fora do escopo expressamente solicitado.
> - Depois de cada alteração, **atualize este arquivo** com a data, o item, os arquivos e linhas modificados e a justificativa técnica antes de encerrar o turno.

---

## 1. Informações Gerais do Projeto

- **Nome:** Gama's Burger
- **Repositório:** Gamas-Burger--main
- **Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Express (`server.ts`) + Firebase (Firestore / Auth)
- **Data da Auditoria e Correções:** 11 de Setembro de 2026
- **Status Geral:** Todas as correções críticas de segurança (2.1 a 2.5), integridade de dados (2.6, 3.1) e privacidade (3.2) foram implementadas, testadas e documentadas.

---

## 2. Matriz de Status dos Itens do PRD

| Item | Descrição | Categoria | Prioridade | Status |
| :--- | :--- | :--- | :--- | :--- |
| **2.1** | Banco de dados Firestore totalmente aberto (`firestore.rules`) | Segurança | 🔴 Crítica | ✅ **Corrigido e Implantado** |
| **2.2** | Autenticação de administrador falsa no client-side (`StoreContext.tsx`) | Segurança | 🔴 Crítica | ✅ **Corrigido e Testado** |
| **2.3** | Autenticação de administrador frágil/replicada no backend (`server.ts`) | Segurança | 🔴 Crítica | ✅ **Corrigido e Testado** |
| **2.4** | Validação de token de admin aceita string arbitrária com 40+ chars | Segurança | 🔴 Crítica | ✅ **Corrigido e Testado** |
| **2.5** | Endpoint `/api/orders?kitchen=true` sem autenticação | Segurança | 🔴 Crítica | ✅ **Corrigido e Testado** |
| **2.6** | Chave de API do Firebase exposta em configuração cliente | Observação | 🟡 Baixa | ✅ **Protegido com Regras 2.1** |
| **3.1** | Status do pedido regride sozinho (`mergeOrders` em `StoreContext.tsx`) | Bug Funcional | 🟠 Alta | ✅ **Corrigido e Testado** |
| **3.2** | Cliente vê pedidos de outros clientes em "Meus Pedidos" (`OrdersHistoryView.tsx`) | Bug + Privacidade | 🔴 Crítica | ✅ **Corrigido e Testado** |

---

## 3. Detalhamento dos Itens e Soluções Implementadas

### Item 2.1 — Banco de dados Firestore totalmente aberto
- **Arquivo:** `firestore.rules`
- **Solução Implementada:** 
  - Regras reescritas com política *deny-by-default*.
  - Leitura pública permitida para o cardápio (`/produtos/{id}`, `/categorias/{id}`, `/cupons/{id}`) e configurações públicas da loja (`/configuracoes/{id}`).
  - Modificações (criação, edição e exclusão de cardápio e configurações) restritas a administradores autenticados (`request.auth != null`).
  - Criação de pedidos pública para novos pedidos com `id == orderId`. Leitura individual para rastreio do cliente.
  - Listagem ampla e atualização de pedidos restrita a administradores autenticados.
  - Regras implantadas com sucesso via `deploy_firebase`.

### Item 2.2 — Autenticação de administrador falsa (client-side)
- **Arquivos:** `src/context/StoreContext.tsx`, `src/components/admin/AdminLoginView.tsx`
- **Solução Implementada:**
  - Removida qualquer verificação de senha estática ou em `localStorage` no frontend.
  - `adminLogin` agora é assíncrono e realiza requisição `POST /api/admin/login` para o backend.
  - Ao iniciar o aplicativo, o token salvo é verificado no endpoint `GET /api/admin/verify`. Se inválido ou expirado, o acesso administrativo é revogado imediatamente.
  - Removidos tokens canônicos em Base64 fixos no código.

### Item 2.3 — Login admin seguro no backend
- **Arquivo:** `server.ts` (`POST /api/admin/login`)
- **Solução Implementada:**
  - Removidas validações frouxas (`cleanEmail.includes('admin')` e `cleanEmail === 'admin@gamasburger.com'`).
  - Autenticação estrita contra `ADMIN_EMAIL` e `ADMIN_PASSWORD` (configuráveis via variáveis de ambiente com fallback seguro).
  - Emissão de token criptográfico aleatório usando `crypto.randomBytes(24).toString('hex')` com TTL de sessão (24 horas).
  - Armazenamento de sessão ativa no mapa `activeAdminSessions`.
  - Criado endpoint `GET /api/admin/verify` para validação de sessões existentes e `POST /api/admin/logout` para revogação.

### Item 2.4 — Validação de token admin sem brecha de 40+ caracteres
- **Arquivo:** `server.ts` (`requireAdminAuth`, `isValidAdminToken`, `GET /api/orders/stream`)
- **Solução Implementada:**
  - Removida a condição `token.length >= 40` e `token.startsWith('firebase_')`.
  - Implementada a função utilitária `isValidAdminToken(token)` que valida se o token consta no mapa de sessões ativas do servidor (`activeAdminSessions`) e se ainda não expirou (TTL de 24h).
  - Middleware `requireAdminAuth` e conexão SSE validam rigorosamente apenas tokens autorizados.

### Item 2.5 — Proteção do endpoint da cozinha (`kitchen=true`)
- **Arquivo:** `server.ts` (`GET /api/orders`)
- **Solução Implementada:**
  - O parâmetro `kitchen === 'true'` agora exige validação via `isValidAdminToken(token)` enviado via Header `Authorization: Bearer <token>` ou query param `token`.
  - Caso não esteja autenticado, retorna imediatamente status HTTP `401 Unauthorized`.

### Item 2.6 — Chave de API Firebase no repositório
- **Arquivo:** `firebase-applet-config.json` e `firestore.rules`
- **Solução Implementada:**
  - A segurança da chave pública do Firebase no cliente foi completamente blindada pela implantação das regras restritivas do Firestore (Item 2.1).

### Item 3.1 — Correção da regressão de status do pedido
- **Arquivo:** `src/context/StoreContext.tsx` (`mergeOrders`)
- **Solução Implementada:**
  - Removido o teste `|| isIncomingNewer` que fazia com que pedidos regredissem para status anteriores devido a assimetria de rede ou timestamps locais desiguais.
  - Agora o status só avança se `incomingRank >= existingRank`, com exceção segura para status `cancelled` (cancelamento pode ocorrer em qualquer etapa).

### Item 3.2 — Proteção de privacidade em "Meus Pedidos"
- **Arquivo:** `src/components/client/OrdersHistoryView.tsx`
- **Solução Implementada:**
  - Removido o bloco de fallback permissivo que retornava `true` para qualquer pedido não-demo na visualização de clientes não autenticados.
  - A lista agora exibe exclusivamente pedidos autenticados pelo cliente (correspondência de ID do pedido local, ID de cliente ou número de telefone registrado).

---

## 4. Log Histórico de Alterações

| Data (UTC) | Item | Arquivos Alterados | Descrição da Alteração / Justificativa |
| :--- | :--- | :--- | :--- |
| 11/09/2026 | 0 | `DOCUMENTACAO-PROJETO.md` | Criação do documento oficial do projeto e mapeamento de todos os itens do PRD. |
| 11/09/2026 | 2.1 | `firestore.rules` | Reescrita das regras de segurança do Firestore com política restritiva deny-by-default; deploy realizado via `deploy_firebase`. |
| 11/09/2026 | 3.1 | `src/context/StoreContext.tsx` | Correção em `mergeOrders` para impedir regressão de status por timestamp desatualizado. |
| 11/09/2026 | 3.2 | `src/components/client/OrdersHistoryView.tsx` | Remoção do fallback permissivo que vazava pedidos de outros clientes na aba Meus Pedidos. |
| 11/09/2026 | 2.3, 2.4, 2.5 | `server.ts`, `.env.example` | Implementada autenticação real com sessões e TTL via `crypto`, remoção do bypass de 40 caracteres, endpoint de verificação de sessão e proteção de autenticação no endpoint da cozinha. |
| 11/09/2026 | 2.2 | `src/context/StoreContext.tsx`, `src/components/admin/AdminLoginView.tsx` | Substituição da autenticação client-side estática por fluxo assíncrono autenticado no servidor com verificação de sessão ativa. |
