import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users2, Plus, Loader2 } from 'lucide-react'
import { useTurmasFormacao } from '@/hooks/useTurmasFormacao'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalCriarTurma } from '@/components/turmasFormacao/ModalCriarTurma'
import { LABEL_ESTADO_TURMA, type EstadoTurma, type TurmaResumo } from '@/types/turmaFormacao'

const CORES_ESTADO: Partial<Record<EstadoTurma, string>> = {
  em_constituicao: 'bg-bg text-subtle',
  submetida_autorizacao: 'bg-badge-orange-bg text-badge-orange-text',
  devolvida_correcao: 'bg-badge-orange-bg text-badge-orange-text',
  nao_autorizada: 'bg-badge-red-bg text-badge-red-text',
  autorizada: 'bg-badge-green-bg text-badge-green-text',
  em_realizacao: 'bg-badge-blue-bg text-badge-blue-text',
  encerrada: 'bg-bg text-subtle',
}

export function TurmasFormacaoLista() {
  const [dioceseId, setDioceseId] = useState('')
  const [estado, setEstado] = useState('')
  const { data: dioceses } = useOpcoesFiltro('dioceses')
  const { data, isLoading } = useTurmasFormacao({ dioceseId: dioceseId ? Number(dioceseId) : undefined, estado: estado || undefined })
  const { criar: podeCriar } = usePermissao('PercursoFormativo')
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Users2 className="size-5 text-muted" /> Turmas de Formação
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="turmas-formacao"
            titulo="Turmas de Formação"
            colunas={[
              { titulo: 'Código', valor: (t: TurmaResumo) => t.codigo },
              { titulo: 'Formação', valor: (t) => t.formacao_nome },
              { titulo: 'Diocese', valor: (t) => t.diocese_nome },
              { titulo: 'Estado', valor: (t) => LABEL_ESTADO_TURMA[t.estado] },
              { titulo: 'Participantes', valor: (t) => t.total_participantes },
              { titulo: 'Formadores', valor: (t) => t.total_formadores },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Nova Turma
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <select value={dioceseId} onChange={(e) => setDioceseId(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todas as dioceses</option>
          {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todos os estados</option>
          {(Object.keys(LABEL_ESTADO_TURMA) as EstadoTurma[]).map((e) => <option key={e} value={e}>{LABEL_ESTADO_TURMA[e]}</option>)}
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((t) => (
          <Link key={t.id} to={`/turmas-formacao/${t.id}`}>
            <Card className="hover-lift p-4">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="font-mono text-[13px] font-semibold text-text">{t.codigo}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${CORES_ESTADO[t.estado] ?? 'bg-bg text-subtle'}`}>{LABEL_ESTADO_TURMA[t.estado]}</span>
              </div>
              <p className="text-[12.5px] text-text">{t.formacao_nome}</p>
              <p className="text-[11.5px] text-subtle">{t.diocese_nome}</p>
              <div className="mt-2 flex items-center justify-between text-[11.5px] text-muted">
                <span>{t.total_participantes} participante{t.total_participantes !== 1 && 's'}{t.maximo_participantes ? ` / ${t.maximo_participantes}` : ''}</span>
                <span>{t.total_formadores} formador{t.total_formadores !== 1 && 'es'}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhuma turma encontrada.</p>}

      {modalAberto && <ModalCriarTurma onClose={() => setModalAberto(false)} />}
    </div>
  )
}
