import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, Plus, Loader2 } from 'lucide-react'
import { useTutorias } from '@/hooks/useTutorias'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalAtribuirTutor } from '@/components/tutorias/ModalAtribuirTutor'
import { LABEL_ESTADO_PRAZO, COR_ESTADO_PRAZO, type EstadoPrazo, type TutoriaResumo } from '@/types/tutoria'

export function TutoriasLista() {
  const [dioceseId, setDioceseId] = useState('')
  const [prazo, setPrazo] = useState('')
  const { data: dioceses } = useOpcoesFiltro('dioceses')
  const { data, isLoading } = useTutorias({ dioceseId: dioceseId ? Number(dioceseId) : undefined, prazo: prazo || undefined })
  const { criar: podeCriar } = usePermissao('PercursoFormativo')
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <UserCheck className="size-5 text-muted" /> Tutoria / Estágio
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="tutorias-estagio"
            titulo="Tutoria / Estágio"
            colunas={[
              { titulo: 'Candidato', valor: (t: TutoriaResumo) => t.nome },
              { titulo: 'Tutor', valor: (t) => t.tutor_nome },
              { titulo: 'Diocese', valor: (t) => t.diocese_nome },
              { titulo: 'Conclusão prevista', valor: (t) => new Date(t.data_prevista_conclusao).toLocaleDateString('pt-PT') },
              { titulo: 'Prazo', valor: (t) => LABEL_ESTADO_PRAZO[t.estado_prazo] },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Atribuir Tutor
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <select value={dioceseId} onChange={(e) => setDioceseId(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todas as dioceses</option>
          {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
        <select value={prazo} onChange={(e) => setPrazo(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todos os prazos</option>
          {(Object.keys(LABEL_ESTADO_PRAZO) as EstadoPrazo[]).map((e) => <option key={e} value={e}>{LABEL_ESTADO_PRAZO[e]}</option>)}
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Candidato</th>
              <th className="px-3.5 py-2.5 font-medium">Tutor</th>
              <th className="px-3.5 py-2.5 font-medium">Diocese</th>
              <th className="px-3.5 py-2.5 font-medium">Conclusão prevista</th>
              <th className="px-3.5 py-2.5 font-medium">Dias restantes</th>
              <th className="px-3.5 py-2.5 font-medium">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && data?.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-subtle">Nenhuma tutoria encontrada.</td></tr>}
            {data?.map((t) => (
              <tr key={t.id} className="cursor-pointer transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5"><Link to={`/tutorias/${t.id}`} className="font-medium text-text hover:underline">{t.nome}</Link></td>
                <td className="px-3.5 py-2.5 text-muted">{t.tutor_nome}</td>
                <td className="px-3.5 py-2.5 text-muted">{t.diocese_nome}</td>
                <td className="px-3.5 py-2.5 text-muted">{new Date(t.data_prevista_conclusao).toLocaleDateString('pt-PT')}</td>
                <td className="px-3.5 py-2.5 text-muted">{t.estado_prazo === 'concluida' ? '—' : t.dias_restantes}</td>
                <td className="px-3.5 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${COR_ESTADO_PRAZO[t.estado_prazo]}`}>{LABEL_ESTADO_PRAZO[t.estado_prazo]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modalAberto && <ModalAtribuirTutor onClose={() => setModalAberto(false)} />}
    </div>
  )
}
