import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, FileCheck, Upload, CircleCheck, CircleX, RotateCcw, Award, HeartHandshake, Search } from 'lucide-react'
import {
  useCandidatoDirigente, useAceitarTermoEtica, useAdicionarDocumentoCandidato,
  useRegistarDecisao, useResubmeterCandidato, useEmitirCertificado, useRegistarPromessa,
} from '@/hooks/useCandidatosDirigente'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { API_BASE_URL } from '@/lib/apiUrl'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { uploadUrl } from '@/lib/uploads'
import { notificar } from '@/lib/notificar'
import {
  LABEL_ESTADO_CANDIDATO, ETAPA_POR_ESTADO, LABEL_ETAPA, CHECKLIST_PADRAO,
  type EstadoCandidato, type TipoDocumentoCandidato, type DecisaoValidacao,
} from '@/types/candidatoDirigente'

const SEQUENCIA: EstadoCandidato[] = ['em_validacao_paroco', 'em_aprovacao_vicarial', 'em_validacao_diocesana', 'na_lista_candidatos']

const LABEL_TIPO_DOC: Record<TipoDocumentoCandidato, string> = {
  parecer_direccao_agrupamento: 'Parecer da Direcção do Agrupamento',
  bilhete_identidade: 'Bilhete de Identidade',
  cedula_baptismal: 'Cédula Baptismal',
  outro: 'Outro',
}

export function CandidatoDetalhePage() {
  const { id } = useParams()
  const candidatoId = Number(id)
  const { data: candidato, isLoading } = useCandidatoDirigente(candidatoId)

  const aceitarTermo = useAceitarTermoEtica(candidatoId)
  const adicionarDocumento = useAdicionarDocumentoCandidato(candidatoId)
  const registarDecisao = useRegistarDecisao(candidatoId)
  const resubmeter = useResubmeterCandidato(candidatoId)
  const emitirCertificado = useEmitirCertificado(candidatoId)
  const registarPromessa = useRegistarPromessa(candidatoId)

  const [dataPromessa, setDataPromessa] = useState('')
  const [localPromessa, setLocalPromessa] = useState('')
  const [pesquisaResponsavel, setPesquisaResponsavel] = useState('')
  const [responsavel, setResponsavel] = useState<{ id: number; nome: string } | null>(null)
  const { data: resultadosResponsavel } = useUtilizadores({ pesquisa: pesquisaResponsavel, porPagina: 6 })

  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumentoCandidato>('bilhete_identidade')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [observacoes, setObservacoes] = useState('')
  const [motivo, setMotivo] = useState('')

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>
  if (!candidato) return null

  const etapaActual = ETAPA_POR_ESTADO[candidato.estado]
  const indiceActual = SEQUENCIA.indexOf(candidato.estado)
  const todosConformes = CHECKLIST_PADRAO.every((c: { chave: string; label: string }) => checklist[c.chave]);

  function onEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) adicionarDocumento.mutate({ ficheiro, tipo: tipoDocumento })
    e.target.value = ''
  }

  async function handleDecisao(decisao: DecisaoValidacao) {
    if (!etapaActual) return
    if (decisao !== 'validado' && !motivo.trim()) { notificar.erro('Indica o motivo.'); return }
    try {
      await registarDecisao.mutateAsync({ etapa: etapaActual, decisao, checklist, observacoes: observacoes || undefined, motivo: motivo || undefined })
      setChecklist({})
      setObservacoes('')
      setMotivo('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a decisão.'))
    }
  }

  async function handleEmitirCertificado() {
    try {
      await emitirCertificado.mutateAsync()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível emitir o certificado.'))
    }
  }

  async function handleRegistarPromessa() {
    if (!dataPromessa || !localPromessa || !responsavel) { notificar.erro('Preenche a data, o local e o responsável.'); return }
    try {
      await registarPromessa.mutateAsync({ data_promessa: dataPromessa, local: localPromessa, responsavel_id: responsavel.id })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a promessa.'))
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/candidatos-dirigente" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar aos candidatos
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">{candidato.nome}</h1>
          <p className="font-mono text-[11.5px] text-subtle">{candidato.codigo_associado}</p>
        </div>
        <span className="rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-semibold text-text">{LABEL_ESTADO_CANDIDATO[candidato.estado]}</span>
      </div>

      <Card className="mb-4 p-4">
        <dl className="grid grid-cols-2 gap-3 text-[12.5px] sm:grid-cols-3">
          <div><dt className="text-subtle">Agrupamento</dt><dd className="text-text">{candidato.agrupamento_nome}</dd></div>
          <div><dt className="text-subtle">Diocese</dt><dd className="text-text">{candidato.diocese_nome}</dd></div>
          <div><dt className="text-subtle">Vigararia</dt><dd className="text-text">{candidato.vigararia_nome ?? '—'}</dd></div>
          <div><dt className="text-subtle">Paróquia</dt><dd className="text-text">{candidato.paroquia_nome ?? '—'}</dd></div>
          <div><dt className="text-subtle">Formação pretendida</dt><dd className="text-text">{candidato.formacao_nome}</dd></div>
          <div><dt className="text-subtle">Registado em</dt><dd className="text-text">{new Date(candidato.created_at).toLocaleDateString('pt-PT')} ({candidato.dias_em_curso} dias)</dd></div>
        </dl>
      </Card>

      {/* Fluxo visual */}
      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Fluxo de validação</p>
        <div className="flex flex-wrap items-center gap-2">
          {SEQUENCIA.map((estado, i) => (
            <span key={estado} className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${i <= indiceActual ? 'bg-[#111827] text-white' : 'bg-bg text-subtle'}`}>
              {LABEL_ESTADO_CANDIDATO[estado]}
            </span>
          ))}
          {(candidato.estado === 'devolvido_correcao' || candidato.estado === 'rejeitado') && (
            <span className="rounded-full bg-badge-red-bg px-3 py-1.5 text-[11.5px] font-semibold text-badge-red-text">
              {LABEL_ESTADO_CANDIDATO[candidato.estado]}
            </span>
          )}
        </div>
      </Card>

      {/* Termo de Ética */}
      <Card className="mb-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12.5px] font-semibold text-muted">Termo de Compromisso Ético</p>
            {candidato.termo_etica?.aceite ? (
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-emerald-600">
                <CircleCheck className="size-3.5" /> Aceite em {new Date(candidato.termo_etica.aceite_em!).toLocaleString('pt-PT')} (v{candidato.termo_etica.versao_termo})
              </p>
            ) : (
              <p className="mt-1 text-[12.5px] text-subtle">Ainda não foi aceite pelo candidato.</p>
            )}
          </div>
          {!candidato.termo_etica?.aceite && (
            <button
              onClick={() => aceitarTermo.mutate()}
              disabled={aceitarTermo.isPending}
              className="rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
            >
              Confirmar aceitação
            </button>
          )}
        </div>
      </Card>

      {/* Documentos */}
      <Card className="mb-4 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] font-semibold text-muted">Documentação do candidato</p>
          <div className="flex items-center gap-2">
            <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as TipoDocumentoCandidato)} className="h-8 rounded-lg border border-border bg-white px-2 text-[11.5px] outline-none focus:border-[#111827]">
              {Object.entries(LABEL_TIPO_DOC).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
            </select>
            <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text transition-colors hover:bg-bg">
              <Upload className="size-3" /> Anexar
              <input type="file" className="hidden" onChange={onEscolherFicheiro} />
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          {candidato.documentos.map((d) => (
            <a key={d.id} href={uploadUrl('candidatos-dirigente-documentos', d.path) ?? '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-bg px-3 py-2 text-[12.5px] text-text hover:underline">
              <FileCheck className="size-3.5 text-subtle" /> {d.nome_ficheiro} <span className="text-[10.5px] text-subtle">({LABEL_TIPO_DOC[d.tipo]})</span>
            </a>
          ))}
          {candidato.documentos.length === 0 && <p className="text-[12px] text-subtle">Nenhum documento anexado ainda.</p>}
        </div>
      </Card>

      {/* Painel de decisão da etapa actual */}
      {etapaActual && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Validação — {LABEL_ETAPA[etapaActual]}</p>

          <div className="mb-3 space-y-1.5">
            {CHECKLIST_PADRAO.map((c: { chave: string; label: string }) => (
              <label key={c.chave} className="flex items-center gap-2.5 rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                <input
                  type="checkbox"
                  checked={!!checklist[c.chave]}
                  onChange={(e) => setChecklist((prev) => ({ ...prev, [c.chave]: e.target.checked }))}
                  className="size-4"
                />
                {c.label}
              </label>
            ))}
          </div>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações (opcional)..."
            rows={2}
            className="mb-2 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (obrigatório para devolver ou rejeitar)"
            className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDecisao('validado')}
              disabled={registarDecisao.isPending || !todosConformes}
              title={!todosConformes ? 'Todos os critérios têm de estar conformes para validar' : ''}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-40"
            >
              <CircleCheck className="size-3.5" /> Validar
            </button>
            <button
              onClick={() => handleDecisao('devolvido')}
              disabled={registarDecisao.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-medium text-text transition-colors hover:bg-bg disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" /> Devolver para correcção
            </button>
            <button
              onClick={() => handleDecisao('rejeitado')}
              disabled={registarDecisao.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-[12.5px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <CircleX className="size-3.5" /> Rejeitar
            </button>
          </div>
        </Card>
      )}

      {candidato.estado === 'devolvido_correcao' && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] text-muted">
            Candidatura devolvida para correcção. Depois de corrigir o que faltava, ressubmete para voltar à mesma etapa.
          </p>
          <button
            onClick={() => resubmeter.mutate()}
            disabled={resubmeter.isPending}
            className="rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
          >
            Resubmeter
          </button>
        </Card>
      )}

      {/* Certificação — RN20: só chega aqui quem estiver em tutoria_validada */}
      {candidato.estado === 'tutoria_validada' && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Certificação</p>
          <p className="mb-3 text-[12px] text-subtle">
            Formação concluída e Tutoria validada — o certificado já pode ser emitido pela Coordenação Nacional.
          </p>
          <button
            onClick={handleEmitirCertificado}
            disabled={emitirCertificado.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
          >
            {emitirCertificado.isPending ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-3.5" />}
            Emitir Certificado
          </button>
        </Card>
      )}

      {candidato.certificado_id && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-[12.5px] font-semibold text-muted">Certificado emitido</p>
          <a
            href={`${API_BASE_URL}/certificados/${candidato.certificado_id}/pdf`}
            target="_blank" rel="noreferrer"
            className="flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text transition-colors hover:bg-bg"
          >
            <Award className="size-3.5" /> Ver Certificado
          </a>
        </Card>
      )}

      {/* Promessa do Dirigente */}
      {candidato.estado === 'certificado_emitido_aguardar_promessa' && (
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Registar Promessa do Dirigente</p>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11.5px] text-subtle">Data da Promessa</label>
              <input type="date" value={dataPromessa} onChange={(e) => setDataPromessa(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]" />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] text-subtle">Local</label>
              <input value={localPromessa} onChange={(e) => setLocalPromessa(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]" />
            </div>
          </div>
          <label className="mb-1 block text-[11.5px] text-subtle">Responsável pela realização</label>
          {responsavel ? (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[13px]">
              {responsavel.nome}
              <button type="button" onClick={() => setResponsavel(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
            </div>
          ) : (
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <input value={pesquisaResponsavel} onChange={(e) => setPesquisaResponsavel(e.target.value)} placeholder="Pesquisar responsável..." className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
              {pesquisaResponsavel.length >= 2 && resultadosResponsavel && resultadosResponsavel.dados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                  {resultadosResponsavel.dados.map((u) => (
                    <button type="button" key={u.id} onClick={() => { setResponsavel({ id: u.id, nome: u.nome }); setPesquisaResponsavel('') }} className="block w-full px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-bg">{u.nome}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleRegistarPromessa}
            disabled={registarPromessa.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
          >
            {registarPromessa.isPending ? <Loader2 className="size-4 animate-spin" /> : <HeartHandshake className="size-3.5" />}
            Registar Promessa
          </button>
        </Card>
      )}

      {candidato.promessa && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-[12.5px] font-semibold text-muted">Promessa realizada</p>
          <p className="text-[12.5px] text-text">
            {new Date(candidato.promessa.data_promessa).toLocaleDateString('pt-PT')} — {candidato.promessa.local}
          </p>
          <p className="text-[11.5px] text-subtle">Responsável: {candidato.promessa.responsavel_nome}</p>
          {candidato.promessa.observacoes && <p className="mt-1 text-[12px] text-muted">{candidato.promessa.observacoes}</p>}
        </Card>
      )}

      {/* Histórico */}
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Histórico de validações</p>
        <div className="space-y-2">
          {candidato.validacoes.map((v) => (
            <div key={v.id} className="rounded-lg bg-bg px-3 py-2.5 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{LABEL_ETAPA[v.etapa]} — {v.decisao}</span>
                <span className="text-[10.5px] text-subtle">{new Date(v.created_at).toLocaleString('pt-PT')}</span>
              </div>
              {v.motivo && <p className="mt-0.5 text-muted">Motivo: {v.motivo}</p>}
              {v.observacoes && <p className="mt-0.5 text-muted">{v.observacoes}</p>}
              <p className="mt-0.5 text-[10.5px] text-subtle">{v.utilizador_nome}</p>
            </div>
          ))}
          {candidato.validacoes.length === 0 && <p className="text-[12px] text-subtle">Ainda sem validações registadas.</p>}
        </div>
      </Card>
    </div>
  )
}
