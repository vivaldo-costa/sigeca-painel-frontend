import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, Pencil, Plus, Trash2, Search, Award } from 'lucide-react'
import { useCurso, useAtribuirFormadorCurso, useRemoverFormadorCurso, useGuardarAvaliacao } from '@/hooks/useCursos'
import { useFormadores } from '@/hooks/useFormadores'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { Card } from '@/components/ui/Card'
import { ModalCursoForm } from '@/components/cursos/ModalCursoForm'
import type { Aproveitamento } from '@/types/curso'

const CORES_APROVEITAMENTO: Record<Aproveitamento, string> = {
  aprovado: 'bg-badge-green-bg text-badge-green-text',
  reprovado: 'bg-badge-red-bg text-badge-red-text',
  pendente: 'bg-bg text-subtle',
}

export function CursoDetalhePage() {
  const { id } = useParams()
  const atividadeId = Number(id)
  const { data: curso, isLoading } = useCurso(atividadeId)
  const [modalEditar, setModalEditar] = useState(false)

  const atribuirFormador = useAtribuirFormadorCurso(atividadeId)
  const removerFormador = useRemoverFormadorCurso(atividadeId)
  const { data: formadores } = useFormadores('')
  const [formadorId, setFormadorId] = useState<number | ''>('')
  const [papel, setPapel] = useState('')

  const guardarAvaliacao = useGuardarAvaliacao(atividadeId)
  const [pesquisaParticipante, setPesquisaParticipante] = useState('')
  const [participanteEscolhido, setParticipanteEscolhido] = useState<{ id: number; nome: string } | null>(null)
  const [nota, setNota] = useState('')
  const [aproveitamento, setAproveitamento] = useState<Aproveitamento>('aprovado')
  const { data: resultadosParticipante } = useUtilizadores({ pesquisa: pesquisaParticipante, porPagina: 6 })

  async function handleAvaliar() {
    if (!participanteEscolhido) return
    await guardarAvaliacao.mutateAsync({ utilizador_id: participanteEscolhido.id, nota, aproveitamento, observacoes: '' })
    setParticipanteEscolhido(null)
    setPesquisaParticipante('')
    setNota('')
  }

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>
  if (!curso) return null

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/cursos" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar aos cursos
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-text">
            {curso.titulo}
            {!!curso.certificacao_automatica && <span title="Certificação automática activa"><Award className="size-4 text-amber-500" /></span>}
          </h1>
          {curso.catalogo_nome && <p className="mt-1 text-[13px] text-subtle">{curso.catalogo_nome}</p>}
        </div>
        <button onClick={() => setModalEditar(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-text transition-colors hover:bg-bg">
          <Pencil className="size-3.5" /> Editar
        </button>
      </div>

      <Card className="mb-4 p-4">
        <p className="text-[12.5px] text-muted">
          {new Date(curso.data_inicio).toLocaleDateString('pt-PT')}
          {curso.data_fim && ` – ${new Date(curso.data_fim).toLocaleDateString('pt-PT')}`}
          {curso.local && ` · ${curso.local}`}
          {curso.carga_horaria && ` · ${curso.carga_horaria}h`}
        </p>
        {curso.descricao && <p className="mt-2 text-[13px] text-text">{curso.descricao}</p>}
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Formadores</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <select value={formadorId} onChange={(e) => setFormadorId(Number(e.target.value) || '')} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
            <option value="">-- Seleccionar formador --</option>
            {formadores?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <input value={papel} onChange={(e) => setPapel(e.target.value)} placeholder="Papel (ex: Formador principal)" className="w-48 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { if (formadorId) { atribuirFormador.mutate({ formador_id: formadorId, papel }); setFormadorId(''); setPapel('') } }}
            disabled={!formadorId || atribuirFormador.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {curso.formadores.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <span>{f.nome} {f.papel && <span className="text-subtle">· {f.papel}</span>}</span>
              <button onClick={() => removerFormador.mutate(f.id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
          {curso.formadores.length === 0 && <p className="text-[12px] text-subtle">Nenhum formador atribuído.</p>}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">
          Avaliações {curso.certificacao_automatica && <span className="text-amber-600">— aprovar emite certificado automaticamente</span>}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {participanteEscolhido ? (
            <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-1.5 text-[12.5px]">
              {participanteEscolhido.nome}
              <button onClick={() => setParticipanteEscolhido(null)} className="text-[11px] text-subtle">Trocar</button>
            </div>
          ) : (
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <input
                value={pesquisaParticipante}
                onChange={(e) => setPesquisaParticipante(e.target.value)}
                placeholder="Pesquisar participante..."
                className="w-full rounded-lg border border-border py-1.5 pl-9 pr-3 text-[12.5px] outline-none focus:border-[#111827]"
              />
              {pesquisaParticipante.length >= 2 && resultadosParticipante && resultadosParticipante.dados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                  {resultadosParticipante.dados.map((u) => (
                    <button key={u.id} onClick={() => { setParticipanteEscolhido({ id: u.id, nome: u.nome }); setPesquisaParticipante('') }} className="block w-full px-3 py-2 text-left text-[12px] transition-colors hover:bg-bg">{u.nome}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <input type="number" step="0.01" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota" className="w-20 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <select value={aproveitamento} onChange={(e) => setAproveitamento(e.target.value as Aproveitamento)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12px] outline-none focus:border-[#111827]">
            <option value="aprovado">Aprovado</option>
            <option value="reprovado">Reprovado</option>
            <option value="pendente">Pendente</option>
          </select>
          <button onClick={handleAvaliar} disabled={!participanteEscolhido || guardarAvaliacao.isPending} className="rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50">
            Guardar
          </button>
        </div>
        <div className="space-y-1.5">
          {curso.avaliacoes.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <span>{a.nome} {a.nota && <span className="text-subtle">· {a.nota}</span>}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${CORES_APROVEITAMENTO[a.aproveitamento]}`}>{a.aproveitamento}</span>
            </div>
          ))}
          {curso.avaliacoes.length === 0 && <p className="text-[12px] text-subtle">Nenhuma avaliação registada.</p>}
        </div>
      </Card>

      {modalEditar && <ModalCursoForm curso={curso} onClose={() => setModalEditar(false)} />}
    </div>
  )
}
