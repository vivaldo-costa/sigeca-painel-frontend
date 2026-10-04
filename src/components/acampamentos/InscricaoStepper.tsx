import { CircleCheck, Circle, CircleX, Clock } from 'lucide-react'
import type { EstadoInscricaoEvento } from '@/types/eventoInscricao'

/**
 * Os 4 estágios do fluxo pedido na secção 5.2: Inscrição → Verificação →
 * Pagamento → Confirmação. `rascunho`/`submetida` mapeiam ao mesmo
 * estágio (ainda não chegou à secretaria) — separá-los visualmente não
 * ajudava, o que importa aqui é onde a pessoa está no processo.
 */
const ESTAGIOS = [
  { chave: 'inscricao', label: 'Inscrição', estados: ['rascunho', 'submetida'] as EstadoInscricaoEvento[] },
  { chave: 'verificacao', label: 'Verificação', estados: ['em_verificacao'] as EstadoInscricaoEvento[] },
  { chave: 'pagamento', label: 'Pagamento', estados: ['aguardando_pagamento'] as EstadoInscricaoEvento[] },
  { chave: 'confirmacao', label: 'Confirmação', estados: ['confirmada', 'presenca_registada'] as EstadoInscricaoEvento[] },
]

const ESTADOS_FORA_DO_FLUXO: Partial<Record<EstadoInscricaoEvento, { label: string; cor: string }>> = {
  lista_espera: { label: 'Lista de Espera', cor: 'text-badge-orange-text' },
  rejeitada: { label: 'Rejeitada', cor: 'text-badge-red-text' },
  cancelada: { label: 'Cancelada', cor: 'text-subtle' },
}

export function InscricaoStepper({ estado }: { estado: EstadoInscricaoEvento }) {
  const foraDoFluxo = ESTADOS_FORA_DO_FLUXO[estado]
  const indiceActual = ESTAGIOS.findIndex((e) => e.estados.includes(estado))

  if (foraDoFluxo) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
        <CircleX className={`size-4 ${foraDoFluxo.cor}`} />
        <span className={`text-[12.5px] font-medium ${foraDoFluxo.cor}`}>{foraDoFluxo.label}</span>
        <span className="text-[11px] text-subtle">— fora do fluxo normal</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {ESTAGIOS.map((estagio, indice) => {
        const concluido = indice < indiceActual
        const actual = indice === indiceActual
        return (
          <div key={estagio.chave} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              {concluido && <CircleCheck className="size-5 text-badge-green-text" />}
              {actual && <Clock className="size-5 text-[#111827]" />}
              {!concluido && !actual && <Circle className="size-5 text-border" />}
              <span className={`text-[10.5px] font-medium ${actual ? 'text-text' : concluido ? 'text-muted' : 'text-subtle'}`}>{estagio.label}</span>
            </div>
            {indice < ESTAGIOS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${concluido ? 'bg-badge-green-text' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
