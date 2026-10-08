import type { LucideIcon } from 'lucide-react'
import {
  ChartLine, Church, MapPinned, Landmark, UsersRound, Layers, UserRound,
  Package, Folder, CalendarDays, GraduationCap, CheckSquare, CircleHelp,
  ShieldCheck, Bell, Flag, ClipboardList, Coins, BadgeCheck, Tent, Settings, DatabaseBackup, Activity, Boxes, Users, ShoppingBag, Warehouse,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  /** Chave do módulo (tabela `modulos`) exigida para ver o item; 'ADMIN' = só administradores. */
  modulo?: string
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  to?: string
  end?: boolean
  items?: NavItem[]
  novo?: boolean
  /** Módulo exigido para o grupo (os itens herdam, salvo se definirem o seu). */
  modulo?: string
}

export interface NavSection {
  label: string
  groups: NavGroup[]
}

/** Fica fora de qualquer secção, sempre visível no topo (como no novo layout). */
export const NAV_DASHBOARD: NavGroup = { label: 'Dashboard', modulo: 'Dashboard', icon: ChartLine, to: '/dashboard' }

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Gestão Institucional',
    groups: [
      { label: 'Dioceses', modulo: 'Dioceses', icon: Church, items: [{ label: 'Nova Diocese', to: '/dioceses/novo' }, { label: 'Consultar Diocese', to: '/dioceses' }] },
      { label: 'Vigararias / Zonas', modulo: 'Vigararias / Zonas', icon: MapPinned, items: [{ label: 'Nova Vigararia', to: '/vigararias/novo' }, { label: 'Consultar Vigararia', to: '/vigararias' }] },
      { label: 'Paróquias', modulo: 'Paróquias', icon: Landmark, items: [{ label: 'Nova Paróquia', to: '/paroquias/novo' }, { label: 'Consultar Paróquia', to: '/paroquias' }] },
      { label: 'Agrupamentos', modulo: 'Agrupamentos', icon: UsersRound, items: [{ label: 'Novo Agrupamento', to: '/agrupamentos/novo' }, { label: 'Consultar Agrupamento', to: '/agrupamentos' }] },
      { label: 'Censo', modulo: 'Censo', icon: ClipboardList, to: '/censo' },
    ],
  },
  {
    label: 'Gestão de Membros',
    groups: [
      {
        label: 'Escuteiros', modulo: 'Escuteiros', icon: UserRound,
        items: [
          { label: 'Novo Escuteiro', to: '/utilizadores/novo' },
          { label: 'Consultar Escuteiro', to: '/utilizadores' },
          { label: 'Transferências', to: '/utilizadores/transferencias' },
          { label: 'Modelo de Cartão', to: '/utilizadores/modelo-cartao', modulo: 'ModeloCartao' },
        ],
      },
      { label: 'Secções', modulo: 'Secções', icon: Layers, items: [{ label: 'Nova Secção', to: '/seccoes/novo' }, { label: 'Consultar Secção', to: '/seccoes' }] },
      { label: 'Denúncias', modulo: 'Denúncias', icon: Flag, to: '/denuncias' },
    ],
  },
  {
    label: 'Actividades',
    groups: [
      { label: 'Actividades', modulo: 'Actividades', icon: CalendarDays, to: '/eventos' },
      {
        label: 'Formação', modulo: 'Formações', icon: GraduationCap,
        items: [
          // 'Formações' (/formacoes) e 'Cursos' (/cursos) — módulo genérico antigo, retirado do menu a pedido
          // da Coordenação (as rotas continuam a existir). A formação de dirigentes faz-se nos itens abaixo.
          { label: 'Catálogo de Formações', to: '/catalogo-formacoes', modulo: 'CatalogoFormacoes' },
          { label: 'Formadores', to: '/formadores', modulo: 'Formadores' },
          { label: 'Percurso Formativo — Candidatos a Dirigente', to: '/candidatos-dirigente', modulo: 'PercursoFormativo' },
          { label: 'Turmas de Formação', to: '/turmas-formacao', modulo: 'PercursoFormativo' },
          { label: 'Tutoria / Estágio', to: '/tutorias', modulo: 'PercursoFormativo' },
          { label: 'Dashboard Nacional', to: '/dashboard-formacao-dirigentes', modulo: 'PercursoFormativo' },
        ],
      },
      { label: 'Gerir eventos', modulo: 'Acampamentos', icon: Tent, to: '/acampamentos' },
      { label: 'Votações', modulo: 'Votações', icon: CheckSquare, to: '/votacoes' },
      { label: 'Certificados', modulo: 'Certificados', icon: BadgeCheck, to: '/certificados' },
    ],
  },
  {
    label: 'Recursos',
    groups: [
      {
        label: 'Vendas', modulo: 'Produtos', icon: Package,
        items: [
          { label: 'Nova Venda (POS)', to: '/vendas/pos' },
          { label: 'Consultar Vendas', to: '/vendas' },
          { label: 'Vendas por Artigo', to: '/vendas/artigos' },
          { label: 'Encomendas', to: '/produtos/encomendas' },
          { label: 'Devoluções / Trocas', to: '/vendas/retornos' },
        ],
      },
      { label: 'Produtos', modulo: 'Produtos', icon: ShoppingBag, to: '/produtos' },
      {
        label: 'Stock', modulo: 'Stock', icon: Warehouse,
        items: [
          { label: 'Inventário', to: '/stock' },
          { label: 'Movimentos', to: '/stock/movimentos' },
          { label: 'Ajustes', to: '/stock/ajustes' },
        ],
      },
      { label: 'Documentos', modulo: 'Documentos', icon: Folder, to: '/documentos' },
      { label: 'Inventário Patrimonial', modulo: 'Inventário', icon: Boxes, to: '/inventario' },
      {
        label: 'Finanças', modulo: 'Finanças', icon: Coins,
        items: [
          { label: 'Quotas', to: '/financas' },
          { label: 'Tesouraria', to: '/tesouraria' },
          { label: 'Regularização / Censo', to: '/financas/regularizacao' },
        ],
      },
    ],
  },
  {
    label: 'Suporte',
    groups: [
      { label: 'Perguntas Frequentes', modulo: 'Perguntas', icon: CircleHelp, to: '/faq' },
    ],
  },
  {
    label: 'Administração',
    groups: [
      { label: 'Gestão de Perfis', modulo: 'Perfis', icon: ShieldCheck, to: '/perfis' },
      { label: 'Bandos / Patrulhas / Equipas', modulo: 'Escuteiros', icon: Users, to: '/unidades-seccao' },
      { label: 'Auditoria', modulo: 'ADMIN', icon: ShieldCheck, to: '/auditoria' },
      { label: 'Geral', modulo: 'ADMIN', icon: Settings, to: '/configuracoes', end: true },
      { label: 'Configuração de E-mail', modulo: 'ADMIN', icon: Bell, to: '/configuracoes/email' },
      { label: 'Configuração de SMS', modulo: 'ADMIN', icon: Bell, to: '/configuracoes/sms' },
      { label: 'Backups e Importação', modulo: 'ADMIN', icon: DatabaseBackup, to: '/backups' },
      { label: 'Sistema', modulo: 'ADMIN', icon: Activity, to: '/sistema' },
      { label: 'Notificações', modulo: 'Notificações', icon: Bell, to: '/notificacoes' },
    ],
  },
]

/** O utilizador pode ver um item/grupo do menu com este módulo? (ADMIN vê tudo) */
export function podeVerModulo(modulo: string | undefined, perfilNome: string | undefined, permissoes: { chave: string; pode_ver: number | boolean }[]) {
  if (perfilNome === 'ADMIN') return true
  if (!modulo) return true
  if (modulo === 'ADMIN') return false
  return permissoes.some((p) => p.chave === modulo && !!p.pode_ver)
}

/** Menu já filtrado pelas permissões do perfil — grupos sem itens visíveis desaparecem. */
export function filtrarMenu(seccoes: NavSection[], perfilNome: string | undefined, permissoes: { chave: string; pode_ver: number | boolean }[]): NavSection[] {
  return seccoes
    .map((seccao) => ({
      ...seccao,
      groups: seccao.groups
        .map((g) => {
          if (!g.items) return podeVerModulo(g.modulo, perfilNome, permissoes) ? g : null
          const items = g.items.filter((i) => podeVerModulo(i.modulo ?? g.modulo, perfilNome, permissoes))
          return items.length ? { ...g, items } : null
        })
        .filter((g): g is NavGroup => g !== null),
    }))
    .filter((s) => s.groups.length > 0)
}

/** Módulos que dizem respeito só ao portal — não dão, por si, acesso ao Painel de Gestão. */
const MODULOS_SO_PORTAL = ['Portal']

/**
 * O acesso ao painel decide-se pelas permissões reais do perfil (perfil_permissoes),
 * e não por uma lista fixa de nomes: qualquer perfil com pelo menos um módulo do painel
 * visível pode entrar e vê apenas esses módulos.
 */
export function temAcessoPainel(perfilNome: string | undefined, permissoes: { chave: string; pode_ver: number | boolean }[]) {
  if (perfilNome === 'ADMIN') return true
  return permissoes.some((p) => !!p.pode_ver && !MODULOS_SO_PORTAL.includes(p.chave))
}

/** Primeira página a que o perfil tem acesso (o Dashboard, se o puder ver). */
export function primeiraRotaPermitida(perfilNome: string | undefined, permissoes: { chave: string; pode_ver: number | boolean }[]): string | null {
  if (podeVerModulo(NAV_DASHBOARD.modulo, perfilNome, permissoes)) return NAV_DASHBOARD.to ?? '/dashboard'
  for (const seccao of filtrarMenu(NAV_SECTIONS, perfilNome, permissoes)) {
    for (const g of seccao.groups) {
      const destino = g.to ?? g.items?.[0]?.to
      if (destino) return destino
    }
  }
  return null
}
