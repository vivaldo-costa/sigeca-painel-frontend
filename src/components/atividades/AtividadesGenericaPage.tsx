import { useState } from 'react'
import { CalendarDays, Plus, Loader2, Search, Pencil, Trash2, Users, MapPin, QrCode } from 'lucide-react'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalAtividadeForm } from './ModalAtividadeForm'
import { ModalInscritos } from './ModalInscritos'
import { ModalPresencas } from './ModalPresencas'
import { uploadUrl } from '@/lib/uploads'
import type { criarHooksAtividade } from '@/hooks/criarHooksAtividade'
import type { FiltrosAtividades, AtividadePainel } from '@/types/atividade'

interface Props {
  titulo: string
  icone: typeof CalendarDays
  moduloChave: string
  hooks: ReturnType<typeof criarHooksAtividade>
}

export function AtividadesGenericaPage({ titulo, icone: Icone, moduloChave, hooks }: Props) {
  const subpastaImagem = moduloChave === 'Formações' ? 'formacoes' : 'eventos'
  const [filtros, setFiltros] = useState<FiltrosAtividades>({})
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [modalForm, setModalForm] = useState<'novo' | AtividadePainel | null>(null)
  const [modalInscritos, setModalInscritos] = useState<AtividadePainel | null>(null)
  const [modalPresencas, setModalPresencas] = useState<AtividadePainel | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<number | null>(null)

  const { data, isLoading } = hooks.useLista(filtros)
  const remover = hooks.useRemover()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao(moduloChave)

  async function handleEliminar(id: number) {
    if (confirmarEliminar !== id) {
      setConfirmarEliminar(id)
      setTimeout(() => setConfirmarEliminar(null), 3000)
      return
    }
    await remover.mutateAsync(id)
    setConfirmarEliminar(null)
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Icone className="size-5 text-muted" /> {titulo}
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro={titulo.toLowerCase().replace(/\s+/g, '-')}
            titulo={titulo}
            colunas={[
              { titulo: 'Título', valor: (a: AtividadePainel) => a.titulo },
              { titulo: 'Data Início', valor: (a: AtividadePainel) => new Date(a.data_inicio).toLocaleDateString('pt-PT') },
              { titulo: 'Data Fim', valor: (a: AtividadePainel) => (a.data_fim ? new Date(a.data_fim).toLocaleDateString('pt-PT') : '—') },
              { titulo: 'Local', valor: (a: AtividadePainel) => a.local ?? '—' },
              { titulo: 'Inscritos', valor: (a: AtividadePainel) => a.total_inscritos },
              { titulo: 'Vagas', valor: (a: AtividadePainel) => a.vagas ?? '—' },
              { titulo: 'Estado', valor: (a: AtividadePainel) => (a.ativo ? 'Activa' : 'Inactiva') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button
              onClick={() => setModalForm('novo')}
              className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              <Plus className="size-3.5" /> Nova
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); setFiltros((f) => ({ ...f, pesquisa: pesquisaRascunho })) }}
          className="relative min-w-[200px] flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Título..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
        <select
          value={filtros.ativo ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, ativo: e.target.value as FiltrosAtividades['ativo'] }))}
          className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
        >
          <option value="">Todos os estados</option>
          <option value="1">Activa</option>
          <option value="0">Inactiva</option>
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      {/* Grelha de colunas, tal como Produtos — nunca uma tabela. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((a, i) => (
          <Card key={a.id} className="hover-lift animate-slide-up overflow-hidden" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
            <div className="relative aspect-[16/9] bg-bg">
              {a.imagem ? (
                <img src={uploadUrl(subpastaImagem, a.imagem)!} className="size-full object-cover" alt={a.titulo} loading="lazy" />
              ) : (
                <div className="grid size-full place-items-center text-subtle"><Icone className="size-8" /></div>
              )}
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${a.tipo_acesso === 'Pago' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                {a.tipo_acesso === 'Pago' ? `${Number(a.valor).toLocaleString('pt-PT')} Kz` : 'Grátis'}
              </span>
              {!a.ativo && (
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Inactiva</span>
              )}
            </div>
            <div className="p-3.5">
              <h3 className="truncate text-[13.5px] font-semibold text-text">{a.titulo}</h3>
              <p className="mt-0.5 text-[11.5px] text-subtle">
                {new Date(a.data_inicio).toLocaleDateString('pt-PT')}
                {a.data_fim && a.data_fim !== a.data_inicio && ` – ${new Date(a.data_fim).toLocaleDateString('pt-PT')}`}
              </p>
              {a.local && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-subtle"><MapPin className="size-3 shrink-0" /> {a.local}</p>
              )}

              <button
                onClick={() => setModalInscritos(a)}
                className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-bg px-2.5 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-border"
              >
                <Users className="size-3.5" /> {a.total_inscritos} inscrito{a.total_inscritos !== 1 && 's'}{a.vagas ? ` / ${a.vagas}` : ''}
              </button>
              <button
                onClick={() => setModalPresencas(a)}
                className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-bg px-2.5 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-border"
              >
                <QrCode className="size-3.5" /> Presenças
              </button>

              {(podeEditar || podeEliminar) && (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  {podeEditar && (
                    <button onClick={() => setModalForm(a)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg">
                      <Pencil className="size-3" /> Editar
                    </button>
                  )}
                  {podeEliminar && (
                    <button
                      onClick={() => handleEliminar(a.id)}
                      disabled={remover.isPending}
                      className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] transition disabled:opacity-50 ${
                        confirmarEliminar === a.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && data?.length === 0 && (
        <p className="py-16 text-center text-sm text-subtle">Nada encontrado.</p>
      )}

      {modalForm && (
        <ModalAtividadeForm
          hooks={hooks}
          atividade={modalForm === 'novo' ? null : modalForm}
          tituloModulo={titulo}
          onClose={() => setModalForm(null)}
        />
      )}
      {modalInscritos && (
        <ModalInscritos hooks={hooks} atividade={modalInscritos} onClose={() => setModalInscritos(null)} />
      )}
      {modalPresencas && (
        <ModalPresencas atividadeId={modalPresencas.id} titulo={modalPresencas.titulo} onClose={() => setModalPresencas(null)} />
      )}
    </div>
  )
}
