import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { seccaoHooks } from '@/hooks/useEstrutura'
import { getApiErrorMessage } from '@/lib/api'
import { FormShell, Campo, Linha2, TextField } from '@/components/crud/FormShell'
import type { Seccao } from '@/types/estrutura'

const VAZIO: Omit<Seccao, 'id'> = { nome: '', faixa_minima: 0, faixa_maxima: 0 }

export function SeccoesForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = !!id
  const { data: existente } = seccaoHooks.useOne(id ? Number(id) : undefined)
  const criar = seccaoHooks.useCreate()
  const actualizar = seccaoHooks.useUpdate()

  const [form, setForm] = useState<Omit<Seccao, 'id'>>(VAZIO)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (existente) setForm(existente)
  }, [existente])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.faixa_maxima < form.faixa_minima) {
      setErro('A idade máxima não pode ser inferior à idade mínima.')
      return
    }
    try {
      if (editando) await actualizar.mutateAsync({ id: Number(id), payload: form })
      else await criar.mutateAsync(form)
      navigate('/seccoes')
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível guardar a secção.'))
    }
  }

  return (
    <FormShell
      titulo={editando ? 'Editar Secção' : 'Nova Secção'}
      voltarHref="/seccoes"
      onSubmit={handleSubmit}
      submitting={criar.isPending || actualizar.isPending}
      erro={erro}
    >
      <Campo label="Nome">
        <TextField required value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
      </Campo>
      <Linha2>
        <Campo label="Idade mínima">
          <TextField
            type="number" min={0} required
            value={form.faixa_minima}
            onChange={(e) => setForm((f) => ({ ...f, faixa_minima: Number(e.target.value) }))}
          />
        </Campo>
        <Campo label="Idade máxima">
          <TextField
            type="number" min={0} required
            value={form.faixa_maxima}
            onChange={(e) => setForm((f) => ({ ...f, faixa_maxima: Number(e.target.value) }))}
          />
        </Campo>
      </Linha2>
    </FormShell>
  )
}
