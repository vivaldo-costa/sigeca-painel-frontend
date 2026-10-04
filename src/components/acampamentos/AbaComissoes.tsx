import { useState } from 'react'
import { ChevronDown, Plus, Trash2, Upload, FileText } from 'lucide-react'
import {
  useEventoComissoes, useCriarComissao,
  useComissaoMembros, useAdicionarMembroComissao, useRemoverMembroComissao,
  useComissaoTarefas, useCriarTarefaComissao, useMudarEstadoTarefa,
  useComissaoDocumentos, useAdicionarDocumentoComissao,
} from '@/hooks/useEventoComissoes'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { Card } from '@/components/ui/Card'
import { uploadUrl } from '@/lib/uploads'
import { cn } from '@/lib/cn'
import { COMISSOES_SUGERIDAS, type EstadoTarefa } from '@/types/eventoComissao'

export function AbaComissoes({ atividadeId }: { atividadeId: number }) {
  const { data: comissoes } = useEventoComissoes(atividadeId)
  const criar = useCriarComissao(atividadeId)
  const [nome, setNome] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [comissaoAberta, setComissaoAberta] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Nova comissão</p>
        <div className="flex flex-wrap gap-2">
          <input
            list="comissoes-sugeridas"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da comissão"
            className="min-w-[180px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <datalist id="comissoes-sugeridas">
            {COMISSOES_SUGERIDAS.map((c) => <option key={c} value={c} />)}
          </datalist>
          <input type="number" value={orcamento} onChange={(e) => setOrcamento(e.target.value)} placeholder="Orçamento" className="w-32 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criar.mutate({ nome, coordenador_id: '', orcamento }); setNome(''); setOrcamento('') }}
            disabled={!nome || criar.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" /> Criar
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {comissoes?.length === 0 && <p className="py-8 text-center text-sm text-subtle">Nenhuma comissão criada ainda.</p>}
        {comissoes?.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <button onClick={() => setComissaoAberta(comissaoAberta === c.id ? null : c.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
              <div>
                <p className="font-semibold text-text">{c.nome}</p>
                <p className="text-[11.5px] text-subtle">
                  {c.coordenador_nome ?? 'Sem coordenador'} · {c.total_membros} membro{c.total_membros !== 1 && 's'} · {c.tarefas_pendentes} tarefa{c.tarefas_pendentes !== 1 && 's'} pendente{c.tarefas_pendentes !== 1 && 's'}
                </p>
              </div>
              <ChevronDown className={cn('size-4 text-subtle transition-transform', comissaoAberta === c.id && 'rotate-180')} />
            </button>
            {comissaoAberta === c.id && <DetalheComissao comissaoId={c.id} />}
          </Card>
        ))}
      </div>
    </div>
  )
}

function DetalheComissao({ comissaoId }: { comissaoId: number }) {
  const { data: membros } = useComissaoMembros(comissaoId)
  const adicionarMembro = useAdicionarMembroComissao(comissaoId)
  const removerMembro = useRemoverMembroComissao(comissaoId)
  const { data: tarefas } = useComissaoTarefas(comissaoId)
  const criarTarefa = useCriarTarefaComissao(comissaoId)
  const mudarEstado = useMudarEstadoTarefa(comissaoId)
  const { data: documentos } = useComissaoDocumentos(comissaoId)
  const adicionarDocumento = useAdicionarDocumentoComissao(comissaoId)

  const [pesquisa, setPesquisa] = useState('')
  const [membroEscolhido, setMembroEscolhido] = useState<{ id: number; nome: string } | null>(null)
  const [funcao, setFuncao] = useState('')
  const { data: resultados } = useUtilizadores({ pesquisa, porPagina: 6 })

  const [novaTarefa, setNovaTarefa] = useState({ titulo: '', descricao: '', prazo: '' })

  return (
    <div className="space-y-4 border-t border-border p-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Membros</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {membroEscolhido ? (
            <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-1.5 text-[12.5px]">
              {membroEscolhido.nome}
              <button onClick={() => setMembroEscolhido(null)} className="text-[11px] text-subtle">Trocar</button>
            </div>
          ) : (
            <div className="relative min-w-[160px] flex-1">
              <input value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Adicionar membro..." className="w-full rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
              {pesquisa.length >= 2 && resultados && resultados.dados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                  {resultados.dados.map((u) => (
                    <button key={u.id} onClick={() => setMembroEscolhido({ id: u.id, nome: u.nome })} className="block w-full px-3 py-2 text-left text-[12px] hover:bg-bg">{u.nome}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <input value={funcao} onChange={(e) => setFuncao(e.target.value)} placeholder="Função" className="w-28 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { if (membroEscolhido) { adicionarMembro.mutate({ utilizador_id: membroEscolhido.id, funcao }); setMembroEscolhido(null); setPesquisa(''); setFuncao('') } }}
            disabled={!membroEscolhido || adicionarMembro.isPending}
            className="rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
        <div className="space-y-1">
          {membros?.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-1.5 text-[12.5px]">
              <span>{m.nome} {m.funcao && <span className="text-subtle">· {m.funcao}</span>}</span>
              <button onClick={() => removerMembro.mutate(m.id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Tarefas</p>
        <div className="mb-2 flex flex-wrap gap-2">
          <input value={novaTarefa.titulo} onChange={(e) => setNovaTarefa((f) => ({ ...f, titulo: e.target.value }))} placeholder="Título da tarefa" className="min-w-[160px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="date" value={novaTarefa.prazo} onChange={(e) => setNovaTarefa((f) => ({ ...f, prazo: e.target.value }))} className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criarTarefa.mutate(novaTarefa); setNovaTarefa({ titulo: '', descricao: '', prazo: '' }) }}
            disabled={!novaTarefa.titulo || criarTarefa.isPending}
            className="rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="space-y-1">
          {tarefas?.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-1.5 text-[12.5px]">
              <span className={t.estado === 'concluida' ? 'text-subtle line-through' : ''}>{t.titulo} {t.prazo && <span className="text-subtle">· {new Date(t.prazo).toLocaleDateString('pt-PT')}</span>}</span>
              <select
                value={t.estado}
                onChange={(e) => mudarEstado.mutate({ id: t.id, estado: e.target.value as EstadoTarefa })}
                className="h-7 rounded-lg border border-border bg-white px-1.5 text-[11px] outline-none"
              >
                <option value="pendente">Pendente</option>
                <option value="em_curso">Em curso</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Documentos</p>
          <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-text hover:bg-bg">
            <Upload className="size-3" /> Enviar
            <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) adicionarDocumento.mutate(f); e.target.value = '' }} />
          </label>
        </div>
        <div className="space-y-1">
          {documentos?.map((d) => (
            <a key={d.id} href={uploadUrl('comissoes-documentos', d.path) ?? '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-bg px-3 py-1.5 text-[12.5px] text-text hover:underline">
              <FileText className="size-3.5 text-subtle" /> {d.nome_ficheiro}
            </a>
          ))}
          {documentos?.length === 0 && <p className="text-[12px] text-subtle">Nenhum documento.</p>}
        </div>
      </div>
    </div>
  )
}
