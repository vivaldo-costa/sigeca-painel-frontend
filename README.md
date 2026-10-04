# SIGECA — Painel de Gestão

Novo frontend do Painel de Gestão do SIGECA (a "segunda metade" do sistema, de uso interno
para dirigentes ADMIN/GESTOR/CONSULTOR), em **React + Vite + TypeScript + Tailwind v4**.

## Relação com o Portal do Escuteiro

Este é um **projecto separado** de `sigeca-portal` (decisão explícita: manter os dois apart
por agora, organizar um monorepo mais tarde se fizer sentido). Os dois:

- Partilham a **mesma sessão PHP** — o login (`index.php`) é idêntico nos dois lados do
  SIGECA; um dirigente autenticado no Painel também está autenticado no Portal.
- Têm **identidades visuais deliberadamente diferentes**: o Portal é a face pública/de marca
  (roxo, azul, navbar escura); o Painel é uma ferramenta de trabalho densa e neutra (cinza,
  tabelas, gráficos) — ver `src/index.css`.
- Não partilham código ainda. Se no futuro isto for reorganizado em monorepo, os candidatos
  óbvios a extrair para `packages/ui` são: `Button`, `Input`, `Alert`, `Card`, `cn()`, o
  cliente `api.ts` e o padrão de `store/auth.ts`.

## Stack

Igual à do Portal, por consistência: Vite, React 19, TypeScript, Tailwind v4 (`@theme`),
React Router, TanStack Query, Zustand, Axios, lucide-react. Acrescenta **recharts** para os
gráficos do dashboard (barras, donut) — o painel actual usa Chart.js, mas recharts integra-se
melhor em React (componentes declarativos em vez de imperativos).

## Design system (`src/index.css`)

Tokens extraídos directamente do `:root` de `painel/index.php` actual:

- **Superfícies/texto**: `bg` (#f7f8fa), `surface` (branco), `border`, `text`, `muted`, `subtle`
- **Paleta categórica dos gráficos**: `c1`…`c8` (mesmas cores do dashboard actual)
- **Badges de estado**: `badge-blue/green/orange/violet/red` (bg + text)
- **Tipografia**: Inter (texto), IBM Plex Mono (números/códigos — `font-mono`)

## Estrutura de pastas

```
src/
  components/
    ui/          # Button, Input, Alert, Card
    layout/      # Sidebar, AppShell, ProtectedRoute
    dashboard/   # KpiRow, FiltrosBar, gráficos e listas do dashboard
  pages/
    auth/        # Login (partilha sessão com o Portal)
    dashboard/   # Dashboard (feito)
    EmConstrucao.tsx   # placeholder para os 14 módulos ainda não migrados
  lib/           # api.ts, cn.ts, nav.ts (estrutura da sidebar)
  hooks/         # useDashboardPainel.ts
  store/         # auth.ts
  types/         # auth.ts, dashboard.ts
```

## Backend real: SIGECA API (Node.js/Express + MySQL, JWT)

A API real (partilhada com o Portal) é **Node.js/Express + MySQL**, autenticação **JWT Bearer**
(não sessão PHP por cookie), base plana `/api/v1` — sem prefixo `/painel`. Ver
`sigeca-portal/README.md` para a tabela completa de diferenças face à hipótese inicial (PHP);
aqui ficam só as notas específicas do Painel:

- **Login partilhado**: mesmo `POST /auth/login`, mesmo `{ identificador, senha }`, mesmos
  tokens. Um dirigente autenticado no Painel também está autenticado no Portal (e vice-versa).
- **`GET /auth/me` devolve `perfil_nome`**, não `perfil` — usado em `ProtectedRoute`, `Sidebar`
  e em todos os `podeEliminar`/`podeFiltrar` do Dashboard e das listas.
- **Sem endpoint de logout** — não há sessão do lado do servidor para invalidar; `logout()` só
  limpa os tokens locais.
- **Perfis reais** (tabela `perfis` da BD): `ADMIN`, `ESCUTEIRO`, `DIRIGENTE`, `CONSULTOR`,
  `TECNICO` — **não existe `SUPER_ADMIN` nem `GESTOR`**, que eu tinha assumido antes de ver o
  schema. `TECNICO` tem "visibilidade de todo o sistema" (`perfis.descricao`), por isso é
  tratado como sem âmbito restrito, tal como `ADMIN`.
- **`ab_diocese` e `ab_agrupamento` são minúsculas** na BD (não `AB_Diocese`/`AB_Agrupamento`)
  — corrigido em `types/estrutura.ts` e nos formulários/listas dos 5 módulos de estrutura.
- **`seccoes` tem uma linha por agrupamento** (mesmo nome repetido em todos os agrupamentos,
  ligada por `seccoes.agrupamento_id`), não uma tabela pequena global — o Dashboard agrega por
  `nome` para produzir a distribuição combinada.
- **Ficheiros enviados**: `https://api.aeca.ao/uploads/perfis/<ficheiro>` (fotos de perfil) —
  usado em `UltimosRegistosCard` via o helper `lib/uploads.ts` (copiado do Portal).

### Dashboard do Painel — implementado e validado

`GET /api/v1/painel/dashboard` já existe no backend (`painelDashboard.model/service/
controller/routes.js`) e `GET /api/v1/filtros/:nivel` também. Validei as duas contra o dump
real da BD (29.290 utilizadores, MariaDB local) — incluindo o âmbito automático por perfil
(ADMIN/TECNICO sem restrição; CONSULTOR limitado à sua diocese). Duas notas sobre os dados
actuais (não são bugs, é só o estado dos dados neste dump):
- Não há nenhuma secção com `seccao_par_id` preenchido → `pares_seccao`/`equivalencias`
  chegam vazios por agora.
- As tabelas `atividades` e `votacoes` estão vazias neste dump → `actividades`, `formacoes` e
  `votacoes` chegam como listas vazias; o Dashboard já trata isso sem erros.

## Autorização por perfil

`ProtectedRoute` exige sessão válida **e** `perfil_nome` em `['ADMIN','CONSULTOR','TECNICO']`
— substitui `requirePerfil()` de `includes/painel_auth.php`. Um ESCUTEIRO ou DIRIGENTE
autenticado vê um ecrã de "Acesso não autorizado" em vez do painel. A barra de filtros do
Dashboard só aparece para `ADMIN`/`TECNICO` (os únicos sem âmbito restrito no backend); os
botões de eliminar nas listas de estrutura exigem `ADMIN`.

## Roteiro de módulos

1. ✅ **Dashboard** — `pages/dashboard/Dashboard.tsx`, réplica completa de `painel/index.php`
   + `painel/api/dashboard.php`: barra de filtros em cascata (Diocese → Vigararia → Paróquia
   → Agrupamento), KPIs, distribuição por secção (com combinação de pares equivalentes:
   Exploradores Juniores≡Flotilha, etc.), género, dioceses, vigararias, agrupamentos,
   paróquias, actividades/formações/votações, sugestões de mudança de secção por idade, e
   últimos registos.
2. ✅ **Dioceses / Vigararias / Paróquias / Agrupamentos / Secções** — CRUD completo dos 5
   módulos de estrutura territorial, construído sobre uma base genérica partilhada:
   - `hooks/createCrudHooks.ts` — fábrica que gera `useList/useOne/useCreate/useUpdate/
     useDelete` para qualquer recurso REST; os 5 módulos só declaram o tipo e o nome do
     recurso (`hooks/useEstrutura.ts`)
   - `components/crud/DataTable.tsx` — tabela com filtros de texto por coluna (client-side,
     tal como o `aplicarFiltros()` do PHP actual) e paginação de 20 em 20
   - `components/crud/FormShell.tsx` — invólucro de formulário com título, `Guardar`/
     `Cancelar` e helpers de campo (`Campo`, `Linha2`, `TextField`, `SelectField`)
   - `components/crud/AcoesLinha.tsx` — Editar/Eliminar por linha, com confirmação inline
     (substitui o `confirm()` nativo do browser usado no PHP actual)

   Hierarquia replicada fielmente: Vigararia depende de Diocese; Paróquia depende de
   Vigararia; Agrupamento depende de Paróquia **através de** uma cascata Vigararia → Paróquia
   no formulário (o campo `vigararia_id` é só auxiliar de UI — filtra as paróquias
   apresentadas — e não é enviado ao backend, tal como o `paroquia.vigararia_id` é obtido por
   `JOIN` no `agrupamento/form.php` actual).
3. ✅ **Escuteiros (CRUD + Transferências + Histórico)** — o maior módulo até agora, com
   backend real (Node.js) implementado e validado contra o dump da BD:
   - `pages/utilizadores/UtilizadoresLista.tsx` — lista **paginada no servidor** (não
     client-side como os 5 módulos de estrutura — inviável com ~29 mil registos), com
     pesquisa por nome/Nº SIGECA e filtros em cascata (Diocese → Vigararia → Paróquia →
     Agrupamento) + Estado + Género
   - `pages/utilizadores/UtilizadorFicha.tsx` — ficha do escuteiro com 3 abas:
     **Dados Pessoais** (editável — nome, género, e-mail, telefone, estado, data de
     nascimento; a estrutura territorial é só de leitura aqui, só muda via Transferência),
     **Histórico** (reaproveita o mesmo endpoint que o Portal usa em `/perfil/timeline` —
     mudanças de secção/cargo + transferências, sem duplicar lógica), e **Transferir**
     (solicitar uma nova transferência com upload de documento, e decidir/cancelar as
     existentes)
   - `pages/utilizadores/UtilizadorNovoForm.tsx` — criação, com a mesma cascata
     Diocese→Vigararia→Paróquia→Agrupamento
   - `pages/transferencias/TransferenciasLista.tsx` — vista global de todos os pedidos de
     transferência (ligada na sidebar), com filtro por estado e as mesmas acções de
     aprovar/rejeitar/cancelar
   - `components/crud/PaginacaoServidor.tsx` — paginação server-side reutilizável, distinta
     da paginação client-side da `DataTable` dos módulos de estrutura
   - `components/crud/BadgesEstado.tsx` — badges de estado do escuteiro e da transferência

   Decisão tomada: o item "Históricos" que estava na sidebar como página à parte foi
   **removido** — ficou mais útil integrado por escuteiro (aba Histórico da Ficha) do que
   como uma vista global solta. O backend (ver `sigeca-api`) já tem tudo isto implementado
   e testado end-to-end contra o dump real, incluindo o efeito colateral de aprovar uma
   transferência realmente mudar o agrupamento (e diocese/vigararia/paróquia em cascata) do
   escuteiro.
4. ⬜ Produtos + Encomendas
5. ✅ **Documentos** — `pages/documentos/DocumentosLista.tsx`, réplica de `painel/documentos/
   index.php` + `form.php` + `save.php`, com backend real implementado e validado:
   - Lista com pesquisa (nome/Nº SIGECA) e filtro por estado (pendente/gerado/cancelado)
   - `ModalNovoDocumento` — pesquisa o escuteiro por Nº SIGECA (equivalente a
     `get_user.php`, agora sobre `atividades`+`inscricoes` reais), lista as actividades em
     que está inscrito, e gera a Declaração de Dispensa num único passo (cria o registo E o
     PDF ao mesmo tempo, tal como o `save.php` actual)
   - Download do PDF via `baixarFicheiroProtegido` (Blob autenticado — um `<a href>` directo
     não enviaria o Bearer token)
   - Cancelar com um clique

   Nota importante: o `save.php` original usa Dompdf (PHP). O backend Node usa **pdfkit**
   (nova dependência, puro Node, sem binários externos) — o texto da declaração está
   fielmente replicado, mas as imagens institucionais (logótipo, carimbo, assinatura) não
   vieram no material fornecido; o gerador procura-as opcionalmente em
   `sigeca-api/src/assets/documentos/*.png` e funciona sem elas se não existirem. Ver
   `sigeca-api/CHANGELOG_PAINEL_DASHBOARD.md` (secção "Adição 4") para o detalhe completo.
6. ⬜ Actividades + Inscrições
7. ⬜ Formações + Inscrições
8. ⬜ Votações
9. ⬜ FAQ
10. ✅ **Gestão de Perfis** — `pages/perfis/PerfisLista.tsx`, réplica de `painel/perfis/
    index.php` + `api_perfis.php`, com backend real implementado e validado:
    - Grid de cards por perfil (badge "Sistema" para os protegidos, contagem de
      utilizadores por perfil)
    - `ModalPerfilForm` — criar/editar (só ADMIN, só perfis não-protegidos; nome
      normalizado para maiúsculas, validado como `^[A-Z]{2,50}$`)
    - `ModalPermissoes` — matriz de módulos × (Ver/Criar/Editar/Apagar), agrupada por
      `modulos.grupo`; ADMIN edita, TECNICO só consulta (`somenteLeitura`); marcar
      Criar/Editar/Apagar activa "Ver" automaticamente
    - Eliminar com confirmação inline (clique duplo), bloqueado para perfis protegidos
11. ⬜ Novidades

Todas as rotas destes módulos já existem no `App.tsx` (ligadas à sidebar completa) e
respondem com `EmConstrucaoPage` — a navegação está toda pronta, falta ligar cada uma ao
módulo real à medida que forem construídos.

### Endpoints consumidos pelo módulo Documentos

✅ **Implementado e validado** — ver `sigeca-api/CHANGELOG_PAINEL_DASHBOARD.md` (secção
"Adição 4").

```
GET   /api/v1/documentos?pesquisa=&estado=
GET   /api/v1/documentos/utilizador/:codigo
POST  /api/v1/documentos      { codigo_associado, atividade_id, entidade_empregadora }
PATCH /api/v1/documentos/:id/cancelar
GET   /api/v1/documentos/:id/pdf
```

### Endpoints consumidos pelo módulo Gestão de Perfis

✅ **Implementado e validado** — ver `sigeca-api/CHANGELOG_PAINEL_DASHBOARD.md` (secção
"Adição 3").

```
GET    /api/v1/perfis
GET    /api/v1/perfis/:id/permissoes
POST   /api/v1/perfis                  { nome, descricao }
PUT    /api/v1/perfis/:id              { nome, descricao }
PUT    /api/v1/perfis/:id/permissoes   { permissoes: { [modulo_id]: {ver,criar,editar,apagar} } }
DELETE /api/v1/perfis/:id
```

### Endpoints consumidos pelo módulo Escuteiros/Transferências

✅ **Implementado e validado** — ver `sigeca-api/CHANGELOG_PAINEL_DASHBOARD.md` (secção
"Adição 2") para o detalhe completo.

```
GET  /api/v1/utilizadores?pagina=&porPagina=&pesquisa=&estado=&genero=
                          &dioceseId=&vigarariaId=&paroquiaId=&agrupamentoId=&seccaoId=
  → { sucesso: true, dados: UtilizadorListagem[], paginacao: { total, pagina, porPagina, totalPaginas } }
GET  /api/v1/utilizadores/:id
PUT  /api/v1/utilizadores/:id
POST /api/v1/utilizadores
GET  /api/v1/utilizadores/:id/historico   → { eventos[] } (mesma fonte do Portal)

GET   /api/v1/transferencias?estado=&agrupamentoId=&escuteiroId=&pagina=&porPagina=
GET   /api/v1/transferencias/:id
POST  /api/v1/transferencias (multipart: documento?, escuteiro_id, agrupamento_destino_id, motivo)
PATCH /api/v1/transferencias/:id/decisao   { estado: 'APROVADA'|'REJEITADA', notas_destino }
PATCH /api/v1/transferencias/:id/cancelar
```

### Endpoints consumidos pelo Dashboard

✅ **Implementado e validado** contra o dump real da BD — ver `sigeca-api/src/models/
painelDashboard.model.js`, `services/painelDashboard.service.js`, `controllers/
painelDashboard.controller.js`, `routes/painelDashboard.routes.js` e `routes/filtros.routes.js`.

```
GET /api/v1/painel/dashboard?diocese=&vigararia=&paroquia=&agrupamento=&seccao=
  → { sucesso: true, dados: { contadores, seccoes[], seccoes_par[], pares_seccao[], genero,
      dioceses[], mudanca_seccao[], equivalencias[], vigararias[], paroquias[], agrupamentos[],
      actividades[], formacoes[], votacoes[], ultimos_utilizadores[], meta } }

GET /api/v1/filtros/dioceses
GET /api/v1/filtros/vigararias?pai=<diocese_id>
GET /api/v1/filtros/paroquias?pai=<vigararia_id>
GET /api/v1/filtros/agrupamentos?pai=<paroquia_id>
  → { sucesso: true, dados: [{ id, nome }] }   (para os selects em cascata da FiltrosBar)
```

`/painel/dashboard` (e só esse) fica fora de `/dashboard` de propósito — essa rota já existe e
é a do Portal (dados de um único utilizador). O backend aplica âmbito automático por perfil:
ADMIN/TECNICO veem tudo; qualquer outro perfil com `diocese_id` fica limitado à sua diocese.

### Endpoints dos módulos de estrutura (CRUD genérico)

⚠️ Nenhum dos 5 recursos existe ainda na API real (ver secção "Backend real" acima) — os hooks
gerados por `createCrudHooks` já estão prontos e alinhados com o envelope real, só falta o
backend. **Sem** prefixo `/painel` (não colidem com nada já implementado):

```
GET    /api/v1/dioceses           → { sucesso: true, dados: Diocese[] }
GET    /api/v1/dioceses/:id       → { sucesso: true, dados: Diocese }
POST   /api/v1/dioceses           → cria (ADMIN/CONSULTOR, conforme exigir_perfil actual)
PUT    /api/v1/dioceses/:id       → actualiza
DELETE /api/v1/dioceses/:id       → elimina (apenas ADMIN, replicar a checagem actual)
```

Mesmo padrão para `/vigararias`, `/paroquias`, `/agrupamentos`, `/seccoes`. Campos por
recurso: ver `src/types/estrutura.ts`. Importante:
- `GET /vigararias` deve devolver `diocese_nome` já resolvido (join), para a tabela não
  precisar de um pedido extra por linha.
- `GET /paroquias` deve devolver `vigararia_nome`.
- `GET /agrupamentos` deve devolver `paroquia_nome`, `diocese_nome` (via
  `agrupamentos → paroquias → vigararias → dioceses`) e `vigararia_id` (para o formulário de
  edição conseguir pré-seleccionar a cascata Vigararia → Paróquia, tal como o `JOIN` que já
  existe em `agrupamento/form.php`).
- `DELETE` deve devolver uma mensagem de erro clara quando há dependências (ex.: não deixar
  eliminar uma Diocese com Vigararias associadas), a apresentar via `Alert` no frontend caso
  o pedido falhe — usar o campo `mensagem` do erro (`{ sucesso: false, mensagem: '...' }`),
  não `message`.

## Como correr

```bash
npm install
npm run dev      # http://localhost:5173 — /api encaminhado para aeca.ao em dev
npm run build    # build de produção em dist/
```
