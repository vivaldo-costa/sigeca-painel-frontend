import { useState, type FormEvent } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { useCriarDocumentoModelo } from '@/hooks/useDocumentoModelos'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, TextField, SelectField } from '@/components/crud/FormShell'
import { notificar } from '@/lib/notificar'

const CATEGORIAS = [
  { valor: 'plano_accao', label: 'Programa / Plano de Acção' },
  { valor: 'relatorio_financeiro', label: 'Relatório de Actividades / Financeiro' },
  { valor: 'geral', label: 'Geral' },
]

export function ModalNovoModelo({ onClose }: { onClose: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('geral')
  const [ficheiro, setFicheiro] = useState<File | null>(null)

  const criar = useCriarDocumentoModelo()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!ficheiro) {
      notificar.erro('Escolhe o ficheiro do modelo.')
      return
    }
    try {
      await criar.mutateAsync({ titulo, descricao: descricao || undefined, categoria, ficheiro })
      notificar.sucesso('Modelo adicionado com sucesso.')
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível adicionar o modelo.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text">
            <Upload className="size-4 text-muted" /> Novo Modelo de Documento
          </h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Campo label="Título">
            <TextField required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Programa / Plano de Acção 2027" />
          </Campo>
          <Campo label="Categoria">
            <SelectField value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
            </SelectField>
          </Campo>
          <Campo label="Descrição (opcional)">
            <TextField value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve explicação do modelo" />
          </Campo>
          <Campo label="Ficheiro (.xlsx, .docx ou .pdf)">
            <input
              type="file"
              required
              accept=".xlsx,.docx,.pdf"
              onChange={(e) => setFicheiro(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-bg file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-text hover:file:bg-border"
            />
          </Campo>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={criar.isPending} className="flex-1">
              {criar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
