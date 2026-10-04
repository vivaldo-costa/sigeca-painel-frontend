export interface EstadoTotp {
  ativo: boolean
  ativado_em: string | null
  codigos_recuperacao_restantes: number
}

export interface ActivacaoTotp {
  segredo: string
  qrCodeDataUrl: string
}

export interface ConfirmacaoTotp {
  codigosRecuperacao: string[]
}
