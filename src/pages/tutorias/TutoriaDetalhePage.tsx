import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, Upload, Send, CircleCheck, CircleX, RotateCcw, FileCheck } from 'lucide-react'
import {
  useTutoria, useAtualizarAcompanhamento, useAdicionarDocumentoTutoria,
  useSubmeterRelatorioTutoria, useDecidirRelatorioTutoria,
} from '@/hooks/useTutorias'
import { useAuthStore } from '@/store/auth'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { uploadUrl } from '@/lib/uploads'
import { LABEL_ESTADO_PRAZO, COR_ESTADO_PRAZO, CRITERIOS_RELATORIO_TUTORIA, type DecisaoTutoria } from '@/types/tutoria'
import { notificar } from '@/lib/notificar'

export function TutoriaDetalhePage() {
  const { id } = useParams()
  const tutoriaId = Number(id)
  const { data: tutoria, isLoading } = useTutoria(tutoriaId)
  const user = useAuthStore((s) => s.user)

  const atualizarAcompanhamento = useAtualizarAcompanhamento(tutoriaId)
  const adicionarDocumento = useAdicionarDocumentoTutoria(tutoriaId)
  const submeterRelatorio = useSubmeterRelatorioTutoria(tutoriaId)
  const decidirRelatorio = useDecidirRelatorioTutoria(tutoriaId)

  const [matriz, setMatriz] = useState('')
  const [ppde, setPpde] = useState('')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [relatorioTexto, setRelatorioTexto] = useState('')
  const [motivoDecisao, setMotivoDecisao] = useState('')

  useEffect(() => {
    if (tutoria) {
      setMatriz(tutoria.matriz_diagnostica ?? '')
      setPpde(tutoria.ppde ?? '')
    }
  }, [tutoria])

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>
  if (!tutoria) return null

  const ehTutor = user?.id === tutoria.tutor_id
  const podeEditarAcompanhamento = ehTutor && (tutoria.estado_candidato === 'em_tutoria')
  const podeSubmeterRelatorio = ehTutor && tutoria.estado_candidato === 'em_tutoria'
  const podeDecidir = tutoria.estado_candidato === 'relatorio_em_validacao'
  const todosCriteriosOk = CRITERIOS_RELATORIO_TUTORIA.every((c) => checklist[c.chave])

  async function handleGuardarAcompanhamento() {
    try {
      await atualizarAcompanhamento.mutateAsync({ matriz_diagnostica: matriz, ppde })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  function onEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) adicionarDocumento.mutate(ficheiro)
    e.target.value = ''
  }

  async function handleSubmeterRelatorio() {
    if (!relatorioTexto.trim()) { notificar.erro('Preenche o texto do relatório.'); return }
    try {
      await submeterRelatorio.mutateAsync({ checklist, relatorio_texto: relatorioTexto })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível submeter o relatório.'))
    }
  }

  async function handleDecisao(decisao: DecisaoTutoria) {
    if (decisao !== 'validado' && !motivoDecisao.trim()) { notificar.erro('Indica o motivo.'); return }
    try {
      await decidirRelatorio.mutateAsync({ decisao, motivo: motivoDecisao || undefined })
      setMotivoDecisao('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a decisão.'))
    }
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/tutorias" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar às tutorias
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">{tutoria.nome}</h1>
          <p className="text-[13px] text-muted">Tutor: {tutoria.tutor_nome} — {tutoria.diocese_nome}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${COR_ESTADO_PRAZO[tutoria.estado_prazo]}`}>{LABEL_ESTADO_PRAZO[tutoria.estado_prazo]}</span>
      </div>


      <Card className="mb-4 p-4">
        <dl className="grid grid-cols-2 gap-3 text-[12.5px] sm:grid-cols-4">
          <div><dt className="text-subtle">Início</dt><dd className="text-text">{new Date(tutoria.data_inicio).toLocaleDateString('pt-PT')}</dd></div>
          <div><dt className="text-subtle">Conclusão prevista</dt><dd className="text-text">{new Date(tutoria.data_prevista_conclusao).toLocaleDateString('pt-PT')}</dd></div>
          <div><dt className="text-subtle">Dias decorridos</dt><dd className="text-text">{tutoria.dias_decorridos}</dd></div>
          <div><dt className="text-subtle">Dias restantes</dt><dd className="text-text">{tutoria.estado_prazo === 'concluida' ? '—' : tutoria.dias_restantes}</dd></div>
        </dl>
      </Card>

      {/* Matriz Diagnóstica + PPDE */}
      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Matriz Diagnóstica</p>
        <textarea
          value={matriz}
          onChange={(e) => setMatriz(e.target.value)}
          disabled={!podeEditarAcompanhamento}
          rows={3}
          placeholder="Pontos fortes, áreas de desenvolvimento..."
          className="mb-4 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
        />
        <p className="mb-3 text-[12.5px] font-semibold text-muted">PPDE — Plano Pessoal de Desenvolvimento Escutista</p>
        <textarea
          value={ppde}
          onChange={(e) => setPpde(e.target.value)}
          disabled={!podeEditarAcompanhamento}
          rows={3}
          placeholder="Plano de desenvolvimento acordado com o candidato..."
          className="w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
        />
        {podeEditarAcompanhamento && (
          <button onClick={handleGuardarAcompanhamento} disabled={atualizarAcompanhamento.isPending} className="mt-3 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">
            {atualizarAcompanhamento.isPending ? <Loader2 className="mr-1.5 inline size-3.5 animate-spin" /> : null}
            Guardar
          </button>
        )}
      </Card>

      {/* Evidências */}
      <Card className="mb-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12.5px] font-semibold text-muted">Evidências</p>
          {podeEditarAcompanhamento && (
            <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text transition-colors hover:bg-bg">
              <Upload className="size-3" /> Anexar
              <input type="file" className="hidden" onChange={onEscolherFicheiro} />
            </label>
          )}
        </div>
        <div className="space-y-1.5">
          {tutoria.documentos.map((d) => (
            <a key={d.id} href={uploadUrl('tutorias-evidencias', d.path) ?? '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-bg px-3 py-2 text-[12.5px] text-text hover:underline">
              <FileCheck className="size-3.5 text-subtle" /> {d.nome_ficheiro}
            </a>
          ))}
          {tutoria.documentos.length === 0 && <p className="text-[12px] text-subtle">Nenhuma evidência anexada ainda.</p>}
        </div>
      </Card>

      {/* Relatório de Tutoria */}
      {podeSubmeterRelatorio && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Relatório de Tutoria</p>
          {(!tutoria.matriz_diagnostica || !tutoria.ppde) && (
            <p className="mb-3 text-[12px] text-badge-orange-text">Preenche e guarda a Matriz Diagnóstica e o PPDE antes de poder submeter.</p>
          )}
          <div className="mb-3 space-y-1.5">
            {CRITERIOS_RELATORIO_TUTORIA.map((c) => (
              <label key={c.chave} className="flex items-center gap-2.5 rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                <input type="checkbox" checked={!!checklist[c.chave]} onChange={(e) => setChecklist((prev) => ({ ...prev, [c.chave]: e.target.checked }))} className="size-4" />
                {c.label}
              </label>
            ))}
          </div>
          <textarea
            value={relatorioTexto}
            onChange={(e) => setRelatorioTexto(e.target.value)}
            placeholder="Texto do relatório..."
            rows={4}
            className="mb-3 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <button
            onClick={handleSubmeterRelatorio}
            disabled={submeterRelatorio.isPending || !todosCriteriosOk || !tutoria.matriz_diagnostica || !tutoria.ppde}
            className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-40"
          >
            {submeterRelatorio.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
            Submeter Relatório
          </button>
        </Card>
      )}

      {tutoria.relatorio && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-[12.5px] font-semibold text-muted">Relatório submetido</p>
          <p className="mb-2 text-[12.5px] text-text">{tutoria.relatorio.relatorio_texto}</p>
          <p className="text-[11px] text-subtle">Submetido em {new Date(tutoria.relatorio.submetido_em).toLocaleString('pt-PT')}</p>
        </Card>
      )}

      {/* Decisão da Equipa */}
      {podeDecidir && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Validação do Relatório de Tutoria</p>
          <input
            value={motivoDecisao}
            onChange={(e) => setMotivoDecisao(e.target.value)}
            placeholder="Motivo (obrigatório para devolver ou não validar)"
            className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleDecisao('validado')} disabled={decidirRelatorio.isPending} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">
              <CircleCheck className="size-3.5" /> Validar
            </button>
            <button onClick={() => handleDecisao('devolvido')} disabled={decidirRelatorio.isPending} className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-medium text-text transition-colors hover:bg-bg disabled:opacity-50">
              <RotateCcw className="size-3.5" /> Devolver
            </button>
            <button onClick={() => handleDecisao('nao_validado')} disabled={decidirRelatorio.isPending} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-[12.5px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              <CircleX className="size-3.5" /> Não Validar
            </button>
          </div>
        </Card>
      )}

      {/* Histórico */}
      {tutoria.validacoes.length > 0 && (
        <Card className="p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Histórico de decisões</p>
          <div className="space-y-2">
            {tutoria.validacoes.map((v) => (
              <div key={v.id} className="rounded-lg bg-bg px-3 py-2.5 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text">{v.decisao}</span>
                  <span className="text-[10.5px] text-subtle">{new Date(v.created_at).toLocaleString('pt-PT')}</span>
                </div>
                {v.motivo && <p className="mt-0.5 text-muted">Motivo: {v.motivo}</p>}
                <p className="mt-0.5 text-[10.5px] text-subtle">{v.utilizador_nome}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
