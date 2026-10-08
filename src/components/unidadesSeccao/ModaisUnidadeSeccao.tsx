import { useMemo, useState, type FormEvent } from 'react'
import { X, Loader2, UserPlus, Search, Printer } from 'lucide-react'
import {
  useCriarUnidadeSeccao, extrairUnidadeExistente, useMembrosUnidadeSeccao, useAdicionarMembrosUnidade, useRetirarMembroUnidade,
} from '@/hooks/useUnidadesSeccao'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { usePermissao } from '@/hooks/usePermissao'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { formatarAgrupamento, inferirTipoUnidadeSeccao } from '@/lib/formatadores'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { LABEL_TIPO_UNIDADE_SECCAO, type TipoUnidadeSeccao, type UnidadeSeccao } from '@/types/unidadeSeccao'
import { cn } from '@/lib/cn'
import { imprimirUnidadesSeccao } from '@/lib/imprimirUnidadesSeccao'

const AJUDA_TIPO: Record<TipoUnidadeSeccao, string> = {
  bando: 'Lobitos (Alcateia)',
  patrulha: 'Exploradores (Juniores e Seniores)',
  equipa: 'Caminheiros (Clã)',
}

/** Criar um Bando, uma Patrulha ou uma Equipa — o tipo é escolhido aqui. */
export function ModalNovaUnidade({ onClose, onCriada }: { onClose: () => void; onCriada: (u: UnidadeSeccao) => void }) {
  const criar = useCriarUnidadeSeccao()
  const [tipo, setTipo] = useState<TipoUnidadeSeccao>('patrulha')
  const [nome, setNome] = useState('')

  async function submeter(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    try {
      const nova = await criar.mutateAsync({ tipo, nome: nome.trim() })
      notificar.sucesso(`${LABEL_TIPO_UNIDADE_SECCAO[tipo]} "${nova.nome}" criad${tipo === 'equipa' || tipo === 'patrulha' ? 'a' : 'o'}.`)
      onCriada(nova)
    } catch (err) {
      const existente = extrairUnidadeExistente(err)
      if (existente) {
        notificar.aviso(`Já existe ${tipo === 'bando' ? 'o bando' : `a ${tipo}`} "${existente.nome}" — abre os membros para lhe juntar escuteiros.`)
        onCriada(existente)
        return
      }
      notificar.erro(getApiErrorMessage(err, 'Não foi possível criar.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submeter} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-text">Novo bando, patrulha ou equipa</h3>
          <button type="button" onClick={onClose} className="text-subtle hover:text-text"><X className="size-4" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['bando', 'patrulha', 'equipa'] as TipoUnidadeSeccao[]).map((t) => (
            <button key={t} type="button" onClick={() => setTipo(t)}
              className={cn('rounded-lg border px-2 py-2 text-left', tipo === t ? 'border-[#111827] bg-[#111827] text-white' : 'border-border hover:bg-bg')}>
              <span className="block text-[13px] font-semibold">{LABEL_TIPO_UNIDADE_SECCAO[t]}</span>
              <span className={cn('block text-[10.5px]', tipo === t ? 'text-white/70' : 'text-subtle')}>{AJUDA_TIPO[t]}</span>
            </button>
          ))}
        </div>
        <input autoFocus required maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome (ex.: Lobo, Águia, São Paulo)"
          className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]" />
        <p className="text-[11.5px] text-subtle">O nome fica disponível para todos os agrupamentos; os membros são de cada agrupamento.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-[13px] font-medium">Cancelar</button>
          <button type="submit" disabled={criar.isPending || !nome.trim()} className="flex-1 rounded-lg bg-[#111827] py-2 text-[13px] font-semibold text-white disabled:opacity-50">Criar</button>
        </div>
      </form>
    </div>
  )
}

/** Membros de um Bando/Patrulha/Equipa: ver, adicionar e retirar. */
export function ModalMembrosUnidade({ unidade, onClose }: { unidade: UnidadeSeccao; onClose: () => void }) {
  const { data: membros, isLoading } = useMembrosUnidadeSeccao(unidade.id)
  const adicionar = useAdicionarMembrosUnidade()
  const retirar = useRetirarMembroUnidade()
  const { editar: podeEditar } = usePermissao('Escuteiros')
  const [aAdicionar, setAAdicionar] = useState(false)
  const [rascunho, setRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [soCompativeis, setSoCompativeis] = useState(true)
  const [escolhidos, setEscolhidos] = useState<number[]>([])
  const { data: candidatos, isFetching } = useUtilizadores({ pesquisa: pesquisa || undefined, porPagina: 50, estado: 'ACTIVO' })

  const lista = useMemo(() => (candidatos?.dados ?? [])
    .filter((u) => u.unidade_seccao_id !== unidade.id)
    .filter((u) => !soCompativeis || !u.seccao_nome || inferirTipoUnidadeSeccao(u.seccao_nome) === unidade.tipo),
  [candidatos, unidade, soCompativeis])

  async function confirmar() {
    try {
      const r = await adicionar.mutateAsync({ id: unidade.id, utilizadorIds: escolhidos })
      notificar.sucesso(r.mensagem)
      setEscolhidos([]); setAAdicionar(false)
    } catch (err) { notificar.erro(getApiErrorMessage(err, 'Não foi possível adicionar.')) }
  }

  const rotulo = LABEL_TIPO_UNIDADE_SECCAO[unidade.tipo]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-bold text-text">{rotulo} {unidade.nome}</h3>
            <p className="text-[12px] text-subtle">{membros?.length ?? 0} membro(s) na tua área</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (!membros?.length) { notificar.aviso('Não há membros para imprimir.'); return }
                imprimirUnidadesSeccao([{ tipo: unidade.tipo, nome: unidade.nome, membros }], {
                  titulo: `Lista de membros — ${rotulo} ${unidade.nome}`,
                  nomeFicheiro: `lista-${unidade.tipo}-${unidade.nome}`,
                })
              }}
              title="Imprimir lista de membros (PDF)"
              className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1.5 text-[11.5px] font-medium text-text hover:bg-bg disabled:opacity-50"
            >
              <Printer className="size-3" /> Imprimir lista
            </button>
            <ExportarBotoes tamanho="sm" nomeFicheiro={`${unidade.tipo}-${unidade.nome}`} titulo={`${rotulo} ${unidade.nome}`}
              colunas={[
                { titulo: 'Nome', valor: (m: { nome: string }) => m.nome },
                { titulo: 'Nº SIGECA', valor: (m: { codigo_associado: string }) => m.codigo_associado },
                { titulo: 'Cargo/Função', valor: (m: { cargo_funcao?: string | null }) => m.cargo_funcao || '—' },
                { titulo: 'Secção', valor: (m: { seccao_nome: string | null }) => m.seccao_nome ?? '—' },
                { titulo: 'Agrupamento', valor: (m: { agrupamento_nome: string | null; ab_agrupamento: string | null }) => (m.agrupamento_nome ? formatarAgrupamento({ nome: m.agrupamento_nome, ab_agrupamento: m.ab_agrupamento }) : '—') },
              ]}
              linhas={membros ?? []} />
            <button onClick={onClose} className="text-subtle hover:text-text"><X className="size-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!aAdicionar ? (
            <>
              {podeEditar && (
                <button onClick={() => setAAdicionar(true)} className="mb-3 flex items-center gap-1.5 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white">
                  <UserPlus className="size-3.5" /> Adicionar membros
                </button>
              )}
              {isLoading && <Loader2 className="mx-auto size-5 animate-spin text-subtle" />}
              {membros?.length === 0 && <p className="py-6 text-center text-[12.5px] text-subtle">Ainda sem membros na tua área.</p>}
              <div className="divide-y divide-border">
                {membros?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 text-[12.5px]">
                    <span>
                      <span className="font-medium text-text">{m.nome}</span> <span className="font-mono text-[11px] text-subtle">{m.codigo_associado}</span>
                      <span className="block text-[11px] text-subtle">{[m.seccao_nome, m.agrupamento_nome && formatarAgrupamento({ nome: m.agrupamento_nome, ab_agrupamento: m.ab_agrupamento })].filter(Boolean).join(' · ')}</span>
                    </span>
                    {podeEditar && <button onClick={() => retirar.mutate({ id: unidade.id, utilizadorId: m.id })} className="text-[11.5px] text-red-500 hover:underline">Retirar</button>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <form onSubmit={(e) => { e.preventDefault(); setPesquisa(rascunho.trim()) }} className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
                <input autoFocus value={rascunho} onChange={(e) => setRascunho(e.target.value)} placeholder="Pesquisar por nome ou Nº SIGECA e carregar Enter…"
                  className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
              </form>
              <label className="mb-2 flex items-center gap-2 text-[12px] text-muted">
                <input type="checkbox" checked={soCompativeis} onChange={(e) => setSoCompativeis(e.target.checked)} className="size-3.5" />
                Mostrar só escuteiros da secção própria de um(a) {rotulo.toLowerCase()} ({AJUDA_TIPO[unidade.tipo]})
              </label>
              {isFetching && <Loader2 className="mx-auto size-4 animate-spin text-subtle" />}
              {!isFetching && lista.length === 0 && <p className="py-6 text-center text-[12.5px] text-subtle">Nenhum escuteiro encontrado.</p>}
              <div className="divide-y divide-border">
                {lista.map((u) => (
                  <label key={u.id} className="flex cursor-pointer items-center gap-2 py-2 text-[12.5px]">
                    <input type="checkbox" checked={escolhidos.includes(u.id)}
                      onChange={() => setEscolhidos((x) => (x.includes(u.id) ? x.filter((y) => y !== u.id) : [...x, u.id]))} />
                    <span className="flex-1">
                      <span className="font-medium text-text">{u.nome}</span> <span className="font-mono text-[11px] text-subtle">{u.codigo_associado}</span>
                      <span className="block text-[11px] text-subtle">
                        {[u.seccao_nome, u.agrupamento_nome && formatarAgrupamento({ nome: u.agrupamento_nome, ab_agrupamento: u.ab_agrupamento }),
                          u.unidade_seccao_nome && `actualmente em: ${u.unidade_seccao_nome}`].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        {aAdicionar && (
          <div className="flex gap-2 border-t border-border px-5 py-3">
            <button onClick={() => { setAAdicionar(false); setEscolhidos([]) }} className="flex-1 rounded-lg border border-border py-2 text-[13px] font-medium">Voltar</button>
            <button onClick={confirmar} disabled={!escolhidos.length || adicionar.isPending} className="flex-1 rounded-lg bg-[#111827] py-2 text-[13px] font-semibold text-white disabled:opacity-50">
              Adicionar {escolhidos.length || ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
