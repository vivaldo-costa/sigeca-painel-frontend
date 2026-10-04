import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Plus, Loader2, Search, Users, Award } from 'lucide-react'
import { useCursos } from '@/hooks/useCursos'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalCursoForm } from '@/components/cursos/ModalCursoForm'
import type { CursoResumo } from '@/types/curso'

export function CursosLista() {
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const { data, isLoading } = useCursos(pesquisa)
  const { criar: podeCriar } = usePermissao('Formações')

  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <GraduationCap className="size-5 text-muted" /> Cursos
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="cursos"
            titulo="Cursos"
            colunas={[
              { titulo: 'Título', valor: (c: CursoResumo) => c.titulo },
              { titulo: 'Catálogo', valor: (c) => c.catalogo_nome ?? '—' },
              { titulo: 'Data Início', valor: (c) => new Date(c.data_inicio).toLocaleDateString('pt-PT') },
              { titulo: 'Data Fim', valor: (c) => (c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-PT') : '—') },
              { titulo: 'Carga Horária', valor: (c) => c.carga_horaria ?? '—' },
              { titulo: 'Inscritos', valor: (c) => c.num_inscritos },
              { titulo: 'Formadores', valor: (c) => c.total_formadores },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Novo Curso
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPesquisa(pesquisaRascunho) }} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Pesquisar curso..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((c) => (
          <Link key={c.id} to={`/cursos/${c.id}`}>
            <Card className="hover-lift p-4">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-text">{c.titulo}</h3>
                {!!c.certificacao_automatica && <span title="Certificação automática"><Award className="size-4 shrink-0 text-amber-500" /></span>}
              </div>
              {c.catalogo_nome && <span className="rounded-full bg-badge-blue-bg px-2 py-0.5 text-[10.5px] font-semibold text-badge-blue-text">{c.catalogo_nome}</span>}
              <p className="mt-2 text-[12px] text-subtle">
                {new Date(c.data_inicio).toLocaleDateString('pt-PT')}
                {c.data_fim && ` – ${new Date(c.data_fim).toLocaleDateString('pt-PT')}`}
              </p>
              {c.carga_horaria && <p className="mt-0.5 text-[12px] text-subtle">{c.carga_horaria}h</p>}
              <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[12px] text-muted">
                <span className="flex items-center gap-1"><Users className="size-3.5" /> {c.num_inscritos} inscrito{c.num_inscritos !== 1 && 's'}</span>
                <span>{c.total_formadores} formador{c.total_formadores !== 1 && 'es'}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhum curso encontrado.</p>}

      {modalAberto && <ModalCursoForm curso={null} onClose={() => setModalAberto(false)} />}
    </div>
  )
}
