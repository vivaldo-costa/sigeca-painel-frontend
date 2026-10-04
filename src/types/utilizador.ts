import type { TipoUnidadeSeccao } from './unidadeSeccao'

export type EstadoUtilizador = 'ACTIVO' | 'VALIDATION' | 'INATIVO' | 'TRANSFERIDO' | 'FALECIDO' | 'PARTIDA'
export type Genero = 'Masculino' | 'Feminino'
export type TipoInscricao = 'Novo' | 'Antigo'
export type AutorizacaoEncarregado = 'Sim' | 'Não'

export interface UtilizadorListagem {
  id: number
  codigo_associado: string
  nome: string
  genero: Genero
  email: string | null
  telefone: string | null
  foto: string | null
  estado: EstadoUtilizador
  perfil_id: number
  perfil_nome: string
  diocese_id: number | null
  vigararia_id: number | null
  paroquia_id: number | null
  agrupamento_id: number | null
  seccao_id: number | null
  data_nascimento: string | null
  created_at: string
  updated_at: string
  diocese_nome: string | null
  vigararia_nome: string | null
  paroquia_nome: string | null
  agrupamento_nome: string | null
  ab_agrupamento?: string | null
  seccao_nome: string | null
  unidade_seccao_id: number | null
  unidade_seccao_nome: string | null
  unidade_seccao_tipo: TipoUnidadeSeccao | null

  // Campos que já existiam na tabela `utilizadores` mas não eram devolvidos
  // pela API nem apareciam no formulário do Painel (Adição 82).
  tipo_inscricao: TipoInscricao | null
  bilhete_identidade: string | null
  naturalidade: string | null
  nacionalidade: string | null
  grupo_sanguineo: string | null
  alergias_restricoes: string | null
  sacramento: string | null // CSV, ex.: "Baptismo, Crisma"
  participacao_grupos_paroquiais: string | null
  data_promessa: string | null
  tempo_permanencia: string | null
  cargo_funcao: string | null
  encarregado_nome: string | null
  encarregado_grau_parentesco: string | null
  encarregado_telefone: string | null
  encarregado_email: string | null
  autorizacao_encarregado: AutorizacaoEncarregado | null
  endereco: string | null
  bairro: string | null
  municipio: string | null
  provincia: string | null
  docs_bi: number | null
  docs_foto: number | null
  docs_matricula: number | null
  docs_cartao_sacramentos: number | null
  docs_cartao_residente: number | null
  docs_taxa_pagamento: number | null
  termo_compromisso: number | null
  assinatura: string | null
  data_assinatura: string | null
}

export interface FiltrosUtilizadores {
  pagina?: number
  porPagina?: number
  estado?: EstadoUtilizador | ''
  pesquisa?: string
  dioceseId?: number
  perfilId?: number
  vigarariaId?: number
  paroquiaId?: number
  agrupamentoId?: number
  agrupamentoIds?: string
  seccaoId?: number
  genero?: Genero | ''
}

export interface Paginacao {
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

/**
 * Campos adicionais (Adição 82) — já existentes na tabela `utilizadores`
 * mas que não apareciam em lado nenhum do formulário do Painel. Nomes
 * iguais aos das colunas da BD, para o payload ir directo ao backend sem
 * mapear nada. Tipo à parte (em vez de directo em `UtilizadorFormPayload`)
 * para poder ser partilhado tal e qual entre o "Adicionar Escuteiro" (que
 * tem também os campos de estrutura territorial) e a aba "Dados Pessoais"
 * da ficha (que não tem esses, só edita estes).
 */
export interface CamposAdicionaisUtilizadorValores {
  tipo_inscricao: TipoInscricao | ''
  bilhete_identidade: string
  naturalidade: string
  nacionalidade: string
  grupo_sanguineo: string
  alergias_restricoes: string
  sacramento: string // CSV, gerido pelos "chips" de sacramentos no formulário
  participacao_grupos_paroquiais: string
  data_promessa: string
  tempo_permanencia: string
  cargo_funcao: string
  encarregado_nome: string
  encarregado_grau_parentesco: string
  encarregado_telefone: string
  encarregado_email: string
  autorizacao_encarregado: AutorizacaoEncarregado | ''
  endereco: string
  bairro: string
  municipio: string
  provincia: string
  docs_bi: boolean
  docs_foto: boolean
  docs_matricula: boolean
  docs_cartao_sacramentos: boolean
  docs_cartao_residente: boolean
  docs_taxa_pagamento: boolean
  termo_compromisso: boolean
  assinatura: string
  data_assinatura: string
}

export interface UtilizadorFormPayload extends CamposAdicionaisUtilizadorValores {
  nome: string
  genero: Genero
  email: string
  telefone: string
  estado: EstadoUtilizador
  perfil_id: number
  diocese_id: number | null
  vigararia_id: number | null
  paroquia_id: number | null
  agrupamento_id: number | null
  seccao_id: number | null
  data_nascimento: string
  codigo_associado?: string // só no criar
  unidade_seccao_id?: number | null
}

/** Estado vazio dos campos adicionais — usado no "Adicionar Escuteiro" e reaproveitado ao editar. */
export const CAMPOS_ADICIONAIS_VAZIO: CamposAdicionaisUtilizadorValores = {
  tipo_inscricao: '',
  bilhete_identidade: '',
  naturalidade: '',
  nacionalidade: 'Angolana',
  grupo_sanguineo: '',
  alergias_restricoes: '',
  sacramento: '',
  participacao_grupos_paroquiais: '',
  data_promessa: '',
  tempo_permanencia: '',
  cargo_funcao: '',
  encarregado_nome: '',
  encarregado_grau_parentesco: '',
  encarregado_telefone: '',
  encarregado_email: '',
  autorizacao_encarregado: '',
  endereco: '',
  bairro: '',
  municipio: '',
  provincia: '',
  docs_bi: false,
  docs_foto: false,
  docs_matricula: false,
  docs_cartao_sacramentos: false,
  docs_cartao_residente: false,
  docs_taxa_pagamento: false,
  termo_compromisso: false,
  assinatura: '',
  data_assinatura: '',
}

/** Converte a linha vinda da API (nulls, docs_* como 0/1) para o formato do formulário. */
export function utilizadorParaCamposAdicionais(u: UtilizadorListagem): CamposAdicionaisUtilizadorValores {
  return {
    tipo_inscricao: u.tipo_inscricao ?? '',
    bilhete_identidade: u.bilhete_identidade ?? '',
    naturalidade: u.naturalidade ?? '',
    nacionalidade: u.nacionalidade ?? '',
    grupo_sanguineo: u.grupo_sanguineo ?? '',
    alergias_restricoes: u.alergias_restricoes ?? '',
    sacramento: u.sacramento ?? '',
    participacao_grupos_paroquiais: u.participacao_grupos_paroquiais ?? '',
    data_promessa: u.data_promessa ?? '',
    tempo_permanencia: u.tempo_permanencia ?? '',
    cargo_funcao: u.cargo_funcao ?? '',
    encarregado_nome: u.encarregado_nome ?? '',
    encarregado_grau_parentesco: u.encarregado_grau_parentesco ?? '',
    encarregado_telefone: u.encarregado_telefone ?? '',
    encarregado_email: u.encarregado_email ?? '',
    autorizacao_encarregado: u.autorizacao_encarregado ?? '',
    endereco: u.endereco ?? '',
    bairro: u.bairro ?? '',
    municipio: u.municipio ?? '',
    provincia: u.provincia ?? '',
    docs_bi: !!u.docs_bi,
    docs_foto: !!u.docs_foto,
    docs_matricula: !!u.docs_matricula,
    docs_cartao_sacramentos: !!u.docs_cartao_sacramentos,
    docs_cartao_residente: !!u.docs_cartao_residente,
    docs_taxa_pagamento: !!u.docs_taxa_pagamento,
    termo_compromisso: !!u.termo_compromisso,
    assinatura: u.assinatura ?? '',
    data_assinatura: u.data_assinatura ?? '',
  }
}

/**
 * Antes de submeter: campos opcionais vazios ('') têm de ir como `null`,
 * nunca como string vazia —
 * - as datas (`date DEFAULT NULL`) porque o MySQL rejeita '' como data;
 * - `tipo_inscricao` e `autorizacao_encarregado` porque são ENUM na BD, e
 *   uma string vazia não é um dos valores permitidos.
 * Os restantes campos de texto vazios podem ir tal e qual (a BD já os
 * aceita como '' ou NULL, sem diferença prática aqui).
 */
export function limparDatasOpcionais<T extends object>(payload: T): T {
  const campos = [
    'data_promessa', 'data_assinatura', 'data_nascimento',
    'tipo_inscricao', 'autorizacao_encarregado',
  ] as const
  const limpo = { ...payload } as Record<string, unknown>
  for (const campo of campos) {
    if (campo in limpo && limpo[campo] === '') {
      limpo[campo] = null
    }
  }
  return limpo as T
}
