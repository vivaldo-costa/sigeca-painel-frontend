import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Trash2, Pencil, Users, X, Presentation, Wrench, Loader2, UserPlus } from 'lucide-react'
import {
  useSessoesEvento, useGuardarSessao, useRemoverSessao, useDefinirLimitesSessoes, useInscritosSessoes,
  useParticipantesSessao, useAdicionarParticipantes, useRetirarParticipante,
  type SessaoEvento, type SessaoPayload, type TipoSessao,
} from '@/hooks/useEventoSessoes'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { formatarAgrupamento } from '@/lib/formatadores'
import { cn } from '@/lib/cn'

const ROTULO: Record<TipoSessao, { um: string; varios: string; ajuda: string }> = {
  painel: { um: 'Painel', varios: 'Painéis', ajuda: 'Ensino teórico' },
  oficina: { um: 'Oficina', varios: 'Oficinas', ajuda: 'Ensino prático do que foi dado nos painéis' },
}

const horario = (s: SessaoEvento) => [
  s.data ? new Date(s.data).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : null,
  s.hora_inicio ? `${s.hora_inicio.slice(0, 5)}${s.hora_fim ? `–${s.hora_fim.slice(0, 5)}` : ''}` : null,
].filter(Boolean).join(' · ')

/**
 * Gerir eventos › Painéis e Oficinas — cria os painéis (teóricos) e as
 * oficinas (práticas), e distribui os inscritos, respeitando as vagas e o
 * número máximo de painéis/oficinas por participante.
 */
export function AbaPaineisOficinas({ atividadeId }: { atividadeId: number }) {
  const { data, isLoading } = useSessoesEvento(atividadeId)
  const remover = useRemoverSessao(atividadeId)
  const confirmar = useConfirmar()
  const [form, setForm] = useState<{ sessao?: SessaoEvento; tipo: TipoSessao } | null>(null)
  const [aberta, setAberta] = useState<SessaoEvento | null>(null)

  const sessoes = data?.sessoes ?? []
  const paineis = sessoes.filter((s) => s.tipo === 'painel')

  async function apagar(s: SessaoEvento) {
    const ok = await confirmar({
      titulo: `Remover ${ROTULO[s.tipo].um.toLowerCase()}`,
      mensagem: `Remover "${s.titulo}"${s.total_participantes ? ` e retirar os ${s.total_participantes} participante(s)` : ''}?`,
      textoConfirmar: 'Remover', perigoso: true,
    })
    if (!ok) return
    try { await remover.mutateAsync(s.id); notificar.sucesso('Removido.') } catch (err) { notificar.erro(getApiErrorMessage(err)) }
  }

  return (
    <div className="space-y-4">
      {data && <LimitesParticipacao atividadeId={atividadeId} limitePaineis={data.limite_paineis} limiteOficinas={data.limite_oficinas} />}

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-subtle" /></div>}

      {(['painel', 'oficina'] as TipoSessao[]).map((tipo) => {
        const lista = sessoes.filter((s) => s.tipo === tipo)
        const Icone = tipo === 'painel' ? Presentation : Wrench
        return (
          <Card key={tipo} className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 text-[14px] font-bold text-text"><Icone className="size-4 text-muted" /> {ROTULO[tipo].varios} ({lista.length})</h3>
                <p className="text-[11.5px] text-subtle">{ROTULO[tipo].ajuda}</p>
              </div>
              <button onClick={() => setForm({ tipo })} className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white">
                <Plus className="size-3.5" /> {tipo === 'painel' ? 'Novo painel' : 'Nova oficina'}
              </button>
            </div>
            {lista.length === 0 && <p className="py-4 text-center text-[12.5px] text-subtle">Ainda não há {ROTULO[tipo].varios.toLowerCase()}.</p>}
            <div className="space-y-1.5">
              {lista.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text">{s.titulo}</p>
                    <p className="text-[11.5px] text-subtle">
                      {[horario(s), s.local, s.responsavel && `Resp.: ${s.responsavel}`, s.painel_titulo && `Pratica: ${s.painel_titulo}`].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <button onClick={() => setAberta(s)} className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] font-medium text-text hover:bg-bg">
                    <Users className="size-3" /> {s.total_participantes}{s.vagas ? ` / ${s.vagas}` : ''}
                  </button>
                  <button onClick={() => setForm({ tipo, sessao: s })} title="Editar" className="text-muted hover:text-text"><Pencil className="size-3.5" /></button>
                  <button onClick={() => apagar(s)} title="Remover" className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </Card>
        )
      })}

      {form && <ModalSessao atividadeId={atividadeId} tipo={form.tipo} sessao={form.sessao} paineis={paineis} onClose={() => setForm(null)} />}
      {aberta && <ModalParticipantes atividadeId={atividadeId} sessao={aberta} limites={data} onClose={() => setAberta(null)} />}
    </div>
  )
}

function LimitesParticipacao({ atividadeId, limitePaineis, limiteOficinas }: { atividadeId: number; limitePaineis: number | null; limiteOficinas: number | null }) {
  const definir = useDefinirLimitesSessoes(atividadeId)
  const [p, setP] = useState(String(limitePaineis ?? 0))
  const [o, setO] = useState(String(limiteOficinas ?? 0))
  const mudou = p !== String(limitePaineis ?? 0) || o !== String(limiteOficinas ?? 0)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    try {
      await definir.mutateAsync({ limite_paineis: Number(p) || 0, limite_oficinas: Number(o) || 0 })
      notificar.sucesso('Limites actualizados.')
    } catch (err) { notificar.erro(getApiErrorMessage(err)) }
  }

  return (
    <Card className="p-4">
      <form onSubmit={guardar} className="flex flex-wrap items-end gap-3 text-[12.5px]">
        <div className="min-w-[200px] flex-1">
          <p className="font-semibold text-text">Participações por inscrito</p>
          <p className="text-[11.5px] text-subtle">Em quantos painéis e oficinas cada inscrito pode participar (0 = sem limite).</p>
        </div>
        <label className="flex flex-col gap-1">Painéis
          <input type="number" min={0} value={p} onChange={(e) => setP(e.target.value)} className="w-24 rounded-lg border border-border px-2 py-1.5" />
        </label>
        <label className="flex flex-col gap-1">Oficinas
          <input type="number" min={0} value={o} onChange={(e) => setO(e.target.value)} className="w-24 rounded-lg border border-border px-2 py-1.5" />
        </label>
        <button type="submit" disabled={!mudou || definir.isPending} className="rounded-lg bg-[#111827] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-40">Guardar</button>
      </form>
    </Card>
  )
}

function ModalSessao({ atividadeId, tipo, sessao, paineis, onClose }: { atividadeId: number; tipo: TipoSessao; sessao?: SessaoEvento; paineis: SessaoEvento[]; onClose: () => void }) {
  const guardar = useGuardarSessao(atividadeId)
  const [f, setF] = useState<SessaoPayload>({
    titulo: sessao?.titulo ?? '', descricao: sessao?.descricao ?? '', responsavel: sessao?.responsavel ?? '',
    data: sessao?.data?.slice(0, 10) ?? '', hora_inicio: sessao?.hora_inicio?.slice(0, 5) ?? '', hora_fim: sessao?.hora_fim?.slice(0, 5) ?? '',
    local: sessao?.local ?? '', vagas: sessao?.vagas ?? '', painel_id: sessao?.painel_id ?? null,
  })
  const set = (patch: SessaoPayload) => setF((x) => ({ ...x, ...patch }))
  const entrada = 'w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]'

  async function submeter(e: FormEvent) {
    e.preventDefault()
    try {
      await guardar.mutateAsync({ id: sessao?.id, payload: { ...f, tipo } })
      notificar.sucesso(sessao ? 'Actualizado.' : `${ROTULO[tipo].um} criad${tipo === 'painel' ? 'o' : 'a'}.`)
      onClose()
    } catch (err) { notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.')) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submeter} className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-text">{sessao ? 'Editar' : 'Novo'} — {ROTULO[tipo].um}</h3>
          <button type="button" onClick={onClose} className="text-subtle hover:text-text"><X className="size-4" /></button>
        </div>
        <input required placeholder="Título" value={f.titulo ?? ''} onChange={(e) => set({ titulo: e.target.value })} className={entrada} />
        <textarea rows={2} placeholder="Descrição / conteúdos" value={f.descricao ?? ''} onChange={(e) => set({ descricao: e.target.value })} className={cn(entrada, 'resize-none')} />
        <input placeholder={tipo === 'painel' ? 'Orador / formador' : 'Monitor / responsável'} value={f.responsavel ?? ''} onChange={(e) => set({ responsavel: e.target.value })} className={entrada} />
        {tipo === 'oficina' && (
          <select value={f.painel_id ?? ''} onChange={(e) => set({ painel_id: Number(e.target.value) || null })} className={entrada}>
            <option value="">Painel teórico relacionado (opcional)</option>
            {paineis.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
          </select>
        )}
        <div className="grid grid-cols-3 gap-2">
          <input type="date" value={f.data ?? ''} onChange={(e) => set({ data: e.target.value })} className={entrada} />
          <input type="time" value={f.hora_inicio ?? ''} onChange={(e) => set({ hora_inicio: e.target.value })} className={entrada} />
          <input type="time" value={f.hora_fim ?? ''} onChange={(e) => set({ hora_fim: e.target.value })} className={entrada} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Local / sala" value={f.local ?? ''} onChange={(e) => set({ local: e.target.value })} className={entrada} />
          <input type="number" min={0} placeholder="Vagas (vazio = sem limite)" value={f.vagas ?? ''} onChange={(e) => set({ vagas: e.target.value })} className={entrada} />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-[13px] font-medium">Cancelar</button>
          <button type="submit" disabled={guardar.isPending} className="flex-1 rounded-lg bg-[#111827] py-2 text-[13px] font-semibold text-white disabled:opacity-50">Guardar</button>
        </div>
      </form>
    </div>
  )
}

function ModalParticipantes({ atividadeId, sessao, limites, onClose }: {
  atividadeId: number; sessao: SessaoEvento; limites?: { limite_paineis: number | null; limite_oficinas: number | null }; onClose: () => void
}) {
  const { data: participantes, isLoading } = useParticipantesSessao(sessao.id)
  const [aAdicionar, setAAdicionar] = useState(false)
  const { data: inscritos } = useInscritosSessoes(atividadeId, aAdicionar)
  const adicionar = useAdicionarParticipantes(atividadeId)
  const retirar = useRetirarParticipante(atividadeId)
  const [escolhidos, setEscolhidos] = useState<number[]>([])
  const [pesquisa, setPesquisa] = useState('')

  const limite = Number(sessao.tipo === 'painel' ? limites?.limite_paineis : limites?.limite_oficinas) || 0
  const jaDentro = useMemo(() => new Set((participantes ?? []).map((p) => p.inscricao_id)), [participantes])
  const disponiveis = useMemo(() => (inscritos ?? [])
    .filter((i) => !jaDentro.has(i.inscricao_id))
    .filter((i) => !pesquisa || `${i.nome} ${i.codigo_associado} ${i.agrupamento_nome ?? ''}`.toLowerCase().includes(pesquisa.toLowerCase())),
  [inscritos, jaDentro, pesquisa])
  const noLimite = (i: { total_paineis: number; total_oficinas: number }) => limite > 0 && (sessao.tipo === 'painel' ? i.total_paineis : i.total_oficinas) >= limite

  async function confirmarAdicao() {
    try {
      const r = await adicionar.mutateAsync({ sessaoId: sessao.id, inscricaoIds: escolhidos })
      notificar.sucesso(r.mensagem)
      setEscolhidos([]); setAAdicionar(false)
    } catch (err) { notificar.erro(getApiErrorMessage(err)) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-bold text-text">{ROTULO[sessao.tipo].um}: {sessao.titulo}</h3>
            <p className="text-[12px] text-subtle">{participantes?.length ?? 0}{sessao.vagas ? ` de ${sessao.vagas} vagas` : ' participante(s)'}{limite ? ` · cada inscrito pode estar em ${limite} ${ROTULO[sessao.tipo].varios.toLowerCase()}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportarBotoes tamanho="sm" nomeFicheiro={`${sessao.tipo}-${sessao.id}-participantes`} titulo={`${ROTULO[sessao.tipo].um}: ${sessao.titulo}`} subtitulo={horario(sessao)}
              colunas={[
                { titulo: 'Nome', valor: (p: { nome: string }) => p.nome },
                { titulo: 'Nº SIGECA', valor: (p: { codigo_associado: string }) => p.codigo_associado },
                { titulo: 'Agrupamento', valor: (p: { agrupamento_nome: string | null; ab_agrupamento: string | null }) => (p.agrupamento_nome ? formatarAgrupamento({ nome: p.agrupamento_nome, ab_agrupamento: p.ab_agrupamento }) : '—') },
              ]}
              linhas={participantes ?? []} />
            <button onClick={onClose} className="text-subtle hover:text-text"><X className="size-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!aAdicionar ? (
            <>
              <button onClick={() => setAAdicionar(true)} className="mb-3 flex items-center gap-1.5 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white"><UserPlus className="size-3.5" /> Adicionar inscritos</button>
              {isLoading && <Loader2 className="mx-auto size-5 animate-spin text-subtle" />}
              {participantes?.length === 0 && <p className="py-6 text-center text-[12.5px] text-subtle">Ainda sem participantes.</p>}
              <div className="divide-y divide-border">
                {participantes?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 text-[12.5px]">
                    <span><span className="font-medium text-text">{p.nome}</span> <span className="font-mono text-[11px] text-subtle">{p.codigo_associado}</span>
                      <span className="block text-[11px] text-subtle">{p.agrupamento_nome ? formatarAgrupamento({ nome: p.agrupamento_nome, ab_agrupamento: p.ab_agrupamento }) : ''}</span></span>
                    <button onClick={() => retirar.mutate({ sessaoId: sessao.id, inscricaoId: p.inscricao_id })} className="text-[11.5px] text-red-500 hover:underline">Retirar</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <input autoFocus value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Pesquisar inscrito, nº SIGECA ou agrupamento…"
                className="mb-2 w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]" />
              {!inscritos && <Loader2 className="mx-auto size-5 animate-spin text-subtle" />}
              {inscritos && disponiveis.length === 0 && <p className="py-6 text-center text-[12.5px] text-subtle">Não há inscritos disponíveis.</p>}
              <div className="divide-y divide-border">
                {disponiveis.map((i) => {
                  const bloqueado = noLimite(i)
                  return (
                    <label key={i.inscricao_id} className={cn('flex items-center gap-2 py-2 text-[12.5px]', bloqueado ? 'opacity-50' : 'cursor-pointer')}>
                      <input type="checkbox" disabled={bloqueado} checked={escolhidos.includes(i.inscricao_id)}
                        onChange={() => setEscolhidos((x) => (x.includes(i.inscricao_id) ? x.filter((y) => y !== i.inscricao_id) : [...x, i.inscricao_id]))} />
                      <span className="flex-1"><span className="font-medium text-text">{i.nome}</span> <span className="font-mono text-[11px] text-subtle">{i.codigo_associado}</span>
                        <span className="block text-[11px] text-subtle">{[i.seccao_nome, i.agrupamento_nome && formatarAgrupamento({ nome: i.agrupamento_nome, ab_agrupamento: i.ab_agrupamento })].filter(Boolean).join(' · ')}</span></span>
                      <span className="text-[11px] text-subtle">{i.total_paineis} painel(éis) · {i.total_oficinas} oficina(s){bloqueado ? ' — no limite' : ''}</span>
                    </label>
                  )
                })}
              </div>
            </>
          )}
        </div>
        {aAdicionar && (
          <div className="flex gap-2 border-t border-border px-5 py-3">
            <button onClick={() => { setAAdicionar(false); setEscolhidos([]) }} className="flex-1 rounded-lg border border-border py-2 text-[13px] font-medium">Voltar</button>
            <button onClick={confirmarAdicao} disabled={!escolhidos.length || adicionar.isPending} className="flex-1 rounded-lg bg-[#111827] py-2 text-[13px] font-semibold text-white disabled:opacity-50">
              Adicionar {escolhidos.length || ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
