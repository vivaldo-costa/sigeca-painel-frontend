import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, Plus, Trash2, Upload, Download, Send, CircleCheck, CircleX, RotateCcw, UserRound, PlayCircle, FileCheck2, Lock } from 'lucide-react'
import {
  useTurmaFormacao, useAdicionarParticipante, useRemoverParticipante,
  useAdicionarFormador, useRemoverFormador, useAdicionarDocumentoTurma,
  useSubmeterTurma, useDecidirAutorizacao,
  useIniciarPreparacao, useIniciarRealizacao, useMarcarRealizada, useEncerrarTurma,
} from '@/hooks/useTurmasFormacao'
import { useCandidatosDirigente } from '@/hooks/useCandidatosDirigente'
import { useFormadores } from '@/hooks/useFormadores'
import { usePermissao } from '@/hooks/usePermissao'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { API_BASE_URL } from '@/lib/apiUrl'
import { formatarAgrupamento } from '@/lib/formatadores'
import { LABEL_ESTADO_TURMA, LABEL_TIPO_DOC_TURMA, type PapelFormador, type TipoDocumentoTurma, type DecisaoAutorizacao } from '@/types/turmaFormacao'
import { notificar } from '@/lib/notificar'

export function TurmaDetalhePage() {
  const { id } = useParams()
  const turmaId = Number(id)
  const { data: turma, isLoading } = useTurmaFormacao(turmaId)
  const { editar: podeEditar } = usePermissao('PercursoFormativo')

  const adicionarParticipante = useAdicionarParticipante(turmaId)
  const removerParticipante = useRemoverParticipante(turmaId)
  const adicionarFormador = useAdicionarFormador(turmaId)
  const removerFormador = useRemoverFormador(turmaId)
  const adicionarDocumento = useAdicionarDocumentoTurma(turmaId)
  const submeter = useSubmeterTurma(turmaId)
  const decidirAutorizacao = useDecidirAutorizacao(turmaId)
  const iniciarPreparacao = useIniciarPreparacao(turmaId)
  const iniciarRealizacao = useIniciarRealizacao(turmaId)
  const marcarRealizada = useMarcarRealizada(turmaId)
  const encerrarTurma = useEncerrarTurma(turmaId)

  const [resumoRelatorio, setResumoRelatorio] = useState('')
  const [concluintes, setConcluintes] = useState('')
  const [observacoesRelatorio, setObservacoesRelatorio] = useState('')

  const { data: candidatosDisponiveis } = useCandidatosDirigente(
    turma ? { dioceseId: turma.diocese_id, estado: 'na_lista_candidatos' } : { dioceseId: -1 },
  )
  const { data: formadoresDisponiveis } = useFormadores('')

  const [candidatoEscolhido, setCandidatoEscolhido] = useState('')
  const [formadorEscolhido, setFormadorEscolhido] = useState('')
  const [papelFormador, setPapelFormador] = useState<PapelFormador>('formador')
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumentoTurma>('programa_formacao')
  const [motivoAutorizacao, setMotivoAutorizacao] = useState('')

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>
  if (!turma) return null

  async function handleAdicionarParticipante() {
    if (!candidatoEscolhido) return
    try {
      await adicionarParticipante.mutateAsync(Number(candidatoEscolhido))
      setCandidatoEscolhido('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível adicionar o participante.'))
    }
  }

  async function handleAdicionarFormador() {
    if (!formadorEscolhido) return
    try {
      await adicionarFormador.mutateAsync({ formador_id: Number(formadorEscolhido), papel: papelFormador })
      setFormadorEscolhido('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível adicionar o formador.'))
    }
  }

  function onEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) adicionarDocumento.mutate({ ficheiro, tipo: tipoDocumento })
    e.target.value = ''
  }

  async function handleSubmeter() {
    try {
      await submeter.mutateAsync()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível submeter.'))
    }
  }

  async function handleAutorizacao(decisao: DecisaoAutorizacao) {
    if (decisao !== 'autorizar' && !motivoAutorizacao.trim()) { notificar.erro('Indica o motivo.'); return }
    try {
      await decidirAutorizacao.mutateAsync({ decisao, motivo: motivoAutorizacao || undefined })
      setMotivoAutorizacao('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a decisão.'))
    }
  }

  async function handleMarcarRealizada() {
    if (!resumoRelatorio.trim()) { notificar.erro('Preenche o resumo da formação.'); return }
    try {
      await marcarRealizada.mutateAsync({
        resumo: resumoRelatorio,
        participantes_concluintes: concluintes ? Number(concluintes) : undefined,
        observacoes: observacoesRelatorio || undefined,
      })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível gerar o relatório.'))
    }
  }

  async function handleEncerrar() {
    try {
      await encerrarTurma.mutateAsync()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível encerrar a turma.'))
    }
  }

  const podeEditarConstituicao = podeEditar && (turma.estado === 'em_constituicao' || turma.estado === 'devolvida_correcao')
  const podeAnexarFecho = podeEditar && turma.estado === 'realizada'
  const podeAnexarDocumentos = podeEditarConstituicao || podeAnexarFecho
  const podeSubmeter = podeEditarConstituicao

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/turmas-formacao" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar às turmas
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">{turma.codigo}</h1>
          <p className="text-[13px] text-muted">{turma.formacao_nome} — {turma.diocese_nome}</p>
        </div>
        <span className="rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-semibold text-text">{LABEL_ESTADO_TURMA[turma.estado]}</span>
      </div>


      <Card className="mb-4 p-4">
        <dl className="grid grid-cols-2 gap-3 text-[12.5px] sm:grid-cols-3">
          <div><dt className="text-subtle">Local</dt><dd className="text-text">{turma.local ?? '—'}</dd></div>
          <div><dt className="text-subtle">Data</dt><dd className="text-text">{turma.data_inicio ? new Date(turma.data_inicio).toLocaleDateString('pt-PT') : '—'} a {turma.data_fim ? new Date(turma.data_fim).toLocaleDateString('pt-PT') : '—'}</dd></div>
          <div><dt className="text-subtle">Participantes</dt><dd className="text-text">{turma.participantes.length}{turma.minimo_participantes && turma.maximo_participantes ? ` (mín. ${turma.minimo_participantes}, máx. ${turma.maximo_participantes})` : ''}</dd></div>
        </dl>
        {turma.numero_autorizacao && (
          <a
            href={`${API_BASE_URL}/turmas-formacao/${turma.id}/declaracao`}
            target="_blank" rel="noreferrer"
            className="mt-3 flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text transition-colors hover:bg-bg"
          >
            <Download className="size-3.5" /> Declaração de Autorização ({turma.numero_autorizacao})
          </a>
        )}
      </Card>

      {/* Participantes */}
      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Participantes</p>
        {podeEditarConstituicao && (
          <div className="mb-3 flex gap-2">
            <select value={candidatoEscolhido} onChange={(e) => setCandidatoEscolhido(e.target.value)} className="h-9 flex-1 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
              <option value="">Escolhe um candidato da Lista de Candidatos...</option>
              {candidatosDisponiveis?.map((c) => <option key={c.id} value={c.id}>{c.nome} — {formatarAgrupamento({ nome: c.agrupamento_nome, ab_agrupamento: c.ab_agrupamento })}</option>)}
            </select>
            <button onClick={handleAdicionarParticipante} disabled={!candidatoEscolhido || adicionarParticipante.isPending} className="rounded-lg bg-[#111827] px-3 py-2 text-white disabled:opacity-50">
              <Plus className="size-3.5" />
            </button>
          </div>
        )}
        <div className="space-y-1.5">
          {turma.participantes.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <span className="flex items-center gap-1.5"><UserRound className="size-3.5 text-subtle" /> {p.nome} <span className="text-[10.5px] text-subtle">({formatarAgrupamento({ nome: p.agrupamento_nome, ab_agrupamento: p.ab_agrupamento })})</span></span>
              {podeEditarConstituicao && (
                <button onClick={() => removerParticipante.mutate(p.candidato_id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
              )}
            </div>
          ))}
          {turma.participantes.length === 0 && <p className="text-[12px] text-subtle">Nenhum participante seleccionado ainda.</p>}
        </div>
      </Card>

      {/* Formadores */}
      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Equipa de Formadores</p>
        {podeEditarConstituicao && (
          <div className="mb-3 flex gap-2">
            <select value={formadorEscolhido} onChange={(e) => setFormadorEscolhido(e.target.value)} className="h-9 flex-1 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
              <option value="">Escolhe um formador...</option>
              {formadoresDisponiveis?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <select value={papelFormador} onChange={(e) => setPapelFormador(e.target.value as PapelFormador)} className="h-9 rounded-lg border border-border bg-white px-2 text-[12.5px] outline-none focus:border-[#111827]">
              <option value="coordenador">Coordenador</option>
              <option value="formador">Formador</option>
              <option value="outro">Outro</option>
            </select>
            <button onClick={handleAdicionarFormador} disabled={!formadorEscolhido || adicionarFormador.isPending} className="rounded-lg bg-[#111827] px-3 py-2 text-white disabled:opacity-50">
              <Plus className="size-3.5" />
            </button>
          </div>
        )}
        <div className="space-y-1.5">
          {turma.formadores.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <span>{f.nome} <span className="text-[10.5px] text-subtle">({f.papel})</span></span>
              {podeEditarConstituicao && (
                <button onClick={() => removerFormador.mutate(f.formador_id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
              )}
            </div>
          ))}
          {turma.formadores.length === 0 && <p className="text-[12px] text-subtle">Nenhum formador indicado ainda.</p>}
        </div>
      </Card>

      {/* Documentos */}
      <Card className="mb-4 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] font-semibold text-muted">Documentos do Pedido</p>
          {podeAnexarDocumentos && (
            <div className="flex items-center gap-2">
              <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as TipoDocumentoTurma)} className="h-8 rounded-lg border border-border bg-white px-2 text-[11.5px] outline-none focus:border-[#111827]">
                {Object.entries(LABEL_TIPO_DOC_TURMA).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
              </select>
              <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text transition-colors hover:bg-bg">
                <Upload className="size-3" /> Anexar
                <input type="file" className="hidden" onChange={onEscolherFicheiro} />
              </label>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          {turma.documentos.map((d) => (
            <div key={d.id} className="flex items-center gap-1.5 rounded-lg bg-bg px-3 py-2 text-[12.5px] text-text">
              {d.nome_ficheiro} <span className="text-[10.5px] text-subtle">({LABEL_TIPO_DOC_TURMA[d.tipo]})</span>
            </div>
          ))}
          {turma.documentos.length === 0 && <p className="text-[12px] text-subtle">Nenhum documento anexado ainda.</p>}
        </div>
      </Card>

      {/* Submeter */}
      {podeSubmeter && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] text-muted">
            Quando a turma tiver local, datas, o mínimo de participantes, um coordenador e os documentos do Programa da Formação e Nota de Pagamento, pode ser submetida ao Secretariado Nacional.
          </p>
          <button
            onClick={handleSubmeter}
            disabled={submeter.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
          >
            {submeter.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
            Submeter para Autorização
          </button>
        </Card>
      )}

      {/* Autorização nacional */}
      {turma.estado === 'submetida_autorizacao' && podeEditar && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Decisão do Secretariado Nacional</p>
          <input
            value={motivoAutorizacao}
            onChange={(e) => setMotivoAutorizacao(e.target.value)}
            placeholder="Motivo (obrigatório para devolver ou não autorizar)"
            className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAutorizacao('autorizar')} disabled={decidirAutorizacao.isPending} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">
              <CircleCheck className="size-3.5" /> Autorizar
            </button>
            <button onClick={() => handleAutorizacao('devolver_correcao')} disabled={decidirAutorizacao.isPending} className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-medium text-text transition-colors hover:bg-bg disabled:opacity-50">
              <RotateCcw className="size-3.5" /> Devolver para correcção
            </button>
            <button onClick={() => handleAutorizacao('nao_autorizar')} disabled={decidirAutorizacao.isPending} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-[12.5px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              <CircleX className="size-3.5" /> Não Autorizar
            </button>
          </div>
        </Card>
      )}

      {/* Ciclo III — Realização da Formação */}
      {turma.estado === 'autorizada' && podeEditar && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] text-muted">Turma autorizada. Quando a Diocese estiver pronta para começar a preparar a realização:</p>
          <button onClick={() => iniciarPreparacao.mutate()} disabled={iniciarPreparacao.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">
            <PlayCircle className="size-3.5" /> Iniciar Preparação
          </button>
        </Card>
      )}

      {turma.estado === 'em_preparacao' && podeEditar && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] text-muted">Turma em preparação. Quando a formação começar de facto — os participantes passam a "Em Formação":</p>
          <button onClick={() => iniciarRealizacao.mutate()} disabled={iniciarRealizacao.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">
            <PlayCircle className="size-3.5" /> Iniciar Realização
          </button>
        </Card>
      )}

      {turma.estado === 'em_realizacao' && podeEditar && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Relatório de Formação</p>
          <p className="mb-3 text-[12px] text-subtle">Preenche a ficha — o SIGECA gera o PDF automaticamente a partir destes dados.</p>
          <textarea
            value={resumoRelatorio}
            onChange={(e) => setResumoRelatorio(e.target.value)}
            placeholder="Resumo da formação (obrigatório)..."
            rows={3}
            className="mb-2 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <input
            type="number" min="0"
            value={concluintes}
            onChange={(e) => setConcluintes(e.target.value)}
            placeholder={`Participantes concluintes (por omissão: ${turma.participantes.length})`}
            className="mb-2 w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <textarea
            value={observacoesRelatorio}
            onChange={(e) => setObservacoesRelatorio(e.target.value)}
            placeholder="Observações (opcional)..."
            rows={2}
            className="mb-3 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <button onClick={handleMarcarRealizada} disabled={marcarRealizada.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">
            {marcarRealizada.isPending ? <Loader2 className="size-4 animate-spin" /> : <FileCheck2 className="size-3.5" />}
            Marcar como Realizada
          </button>
        </Card>
      )}

      {turma.relatorio && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-[12.5px] font-semibold text-muted">Relatório de Formação</p>
          <p className="mb-2 text-[12.5px] text-text">{turma.relatorio.resumo}</p>
          <a
            href={`${API_BASE_URL}/turmas-formacao/${turma.id}/relatorio`}
            target="_blank" rel="noreferrer"
            className="flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text transition-colors hover:bg-bg"
          >
            <Download className="size-3.5" /> Descarregar Relatório (PDF)
          </a>
        </Card>
      )}

      {turma.estado === 'realizada' && podeEditar && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] text-muted">
            Para encerrar, anexa nos Documentos acima: a(s) Lista(s) de Presença, a Ficha de Avaliação Geral e a Avaliação dos Formadores.
          </p>
          <button onClick={handleEncerrar} disabled={encerrarTurma.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">
            {encerrarTurma.isPending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-3.5" />}
            Encerrar Turma
          </button>
        </Card>
      )}

      {/* Histórico de autorizações */}
      {turma.autorizacoes.length > 0 && (
        <Card className="p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Histórico de decisões</p>
          <div className="space-y-2">
            {turma.autorizacoes.map((a) => (
              <div key={a.id} className="rounded-lg bg-bg px-3 py-2.5 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text">{a.decisao}</span>
                  <span className="text-[10.5px] text-subtle">{new Date(a.created_at).toLocaleString('pt-PT')}</span>
                </div>
                {a.motivo && <p className="mt-0.5 text-muted">Motivo: {a.motivo}</p>}
                <p className="mt-0.5 text-[10.5px] text-subtle">{a.utilizador_nome}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
