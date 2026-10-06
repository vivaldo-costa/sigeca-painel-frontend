import type { LucideIcon } from 'lucide-react'
import {
  ChartLine, Church, MapPinned, Landmark, UsersRound, Layers, UserRound,
  Package, Folder, CalendarDays, GraduationCap, CheckSquare, CircleHelp,
  ShieldCheck, Bell, Flag, ClipboardList, Coins, BadgeCheck, Tent, Settings, DatabaseBackup, Activity, Boxes, Users, ShoppingBag, Warehouse,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  to?: string
  end?: boolean
  items?: NavItem[]
  novo?: boolean
}

export interface NavSection {
  label: string
  groups: NavGroup[]
}

/** Fica fora de qualquer secção, sempre visível no topo (como no novo layout). */
export const NAV_DASHBOARD: NavGroup = { label: 'Dashboard', icon: ChartLine, to: '/dashboard' }

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Gestão Institucional',
    groups: [
      { label: 'Dioceses', icon: Church, items: [{ label: 'Consultar Diocese', to: '/dioceses' }, { label: 'Nova Diocese', to: '/dioceses/novo' }] },
      { label: 'Vigararias / Zonas', icon: MapPinned, items: [{ label: 'Consultar Vigararia', to: '/vigararias' }, { label: 'Nova Vigararia', to: '/vigararias/novo' }] },
      { label: 'Paróquias', icon: Landmark, items: [{ label: 'Consultar Paróquia', to: '/paroquias' }, { label: 'Nova Paróquia', to: '/paroquias/novo' }] },
      { label: 'Agrupamentos', icon: UsersRound, items: [{ label: 'Consultar Agrupamento', to: '/agrupamentos' }, { label: 'Novo Agrupamento', to: '/agrupamentos/novo' }] },
      { label: 'Censo', icon: ClipboardList, to: '/censo' },
    ],
  },
  {
    label: 'Gestão de Membros',
    groups: [
      {
        label: 'Escuteiros', icon: UserRound,
        items: [
          { label: 'Consultar Escuteiro', to: '/utilizadores' },
          { label: 'Novo Escuteiro', to: '/utilizadores/novo' },
          { label: 'Transferências', to: '/utilizadores/transferencias' },
          { label: 'Modelo de Cartão', to: '/utilizadores/modelo-cartao' },
        ],
      },
      { label: 'Secções', icon: Layers, items: [{ label: 'Consultar Secção', to: '/seccoes' }, { label: 'Nova Secção', to: '/seccoes/novo' }] },
      { label: 'Denúncias', icon: Flag, to: '/denuncias' },
    ],
  },
  {
    label: 'Actividades',
    groups: [
      { label: 'Actividades', icon: CalendarDays, to: '/eventos' },
      {
        label: 'Formação', icon: GraduationCap,
        items: [
          { label: 'Formações', to: '/formacoes' },
          { label: 'Cursos', to: '/cursos' },
          { label: 'Catálogo de Formações', to: '/catalogo-formacoes' },
          { label: 'Formadores', to: '/formadores' },
          { label: 'Percurso Formativo — Candidatos a Dirigente', to: '/candidatos-dirigente' },
          { label: 'Turmas de Formação', to: '/turmas-formacao' },
          { label: 'Tutoria / Estágio', to: '/tutorias' },
          { label: 'Dashboard Nacional', to: '/dashboard-formacao-dirigentes' },
        ],
      },
      { label: 'Eventos', icon: Tent, to: '/acampamentos' },
      { label: 'Votações', icon: CheckSquare, to: '/votacoes' },
      { label: 'Certificados', icon: BadgeCheck, to: '/certificados' },
    ],
  },
  {
    label: 'Recursos',
    groups: [
      {
        label: 'Vendas', icon: Package,
        items: [
          { label: 'Nova Venda (POS)', to: '/vendas/pos' },
          { label: 'Consultar Vendas', to: '/vendas' },
          { label: 'Encomendas', to: '/produtos/encomendas' },
          { label: 'Devoluções / Trocas', to: '/vendas/retornos' },
        ],
      },
      { label: 'Produtos', icon: ShoppingBag, to: '/produtos' },
      {
        label: 'Stock', icon: Warehouse,
        items: [
          { label: 'Inventário', to: '/stock' },
          { label: 'Movimentos', to: '/stock/movimentos' },
          { label: 'Ajustes', to: '/stock/ajustes' },
        ],
      },
      { label: 'Documentos', icon: Folder, to: '/documentos' },
      { label: 'Inventário Patrimonial', icon: Boxes, to: '/inventario' },
      {
        label: 'Finanças', icon: Coins,
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
      { label: 'Perguntas Frequentes', icon: CircleHelp, to: '/faq' },
    ],
  },
  {
    label: 'Administração',
    groups: [
      { label: 'Gestão de Perfis', icon: ShieldCheck, to: '/perfis' },
      { label: 'Bandos / Patrulhas / Equipas', icon: Users, to: '/unidades-seccao' },
      { label: 'Auditoria', icon: ShieldCheck, to: '/auditoria' },
      { label: 'Geral', icon: Settings, to: '/configuracoes', end: true },
      { label: 'Configuração de E-mail', icon: Bell, to: '/configuracoes/email' },
      { label: 'Configuração de SMS', icon: Bell, to: '/configuracoes/sms' },
      { label: 'Backups e Importação', icon: DatabaseBackup, to: '/backups' },
      { label: 'Sistema', icon: Activity, to: '/sistema' },
      { label: 'Notificações', icon: Bell, to: '/notificacoes' },
    ],
  },
]
