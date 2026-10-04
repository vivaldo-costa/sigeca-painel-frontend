import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { paroquiaHooks, vigarariaHooks } from '@/hooks/useEstrutura'
import { getApiErrorMessage } from '@/lib/api'
import { FormShell, Campo, TextField, SelectField } from '@/components/crud/FormShell'
import type { Paroquia } from '@/types/estrutura'

const VAZIO: Omit<Paroquia, 'id'> = {
  nome: '', paroco: '', telefone: '', email: '', endereco: '', vigararia_id: 0,
}

export function ParoquiasForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = !!id
  const { data: existente } = paroquiaHooks.useOne(id ? Number(id) : undefined)
  const { data: vigararias } = vigarariaHooks.useList()
  const criar = paroquiaHooks.useCreate()
  const actualizar = paroquiaHooks.useUpdate()

  const [form, setForm] = useState<Omit<Paroquia, 'id'>>(VAZIO)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (existente) setForm(existente)
  }, [existente])

  function campo(nome: keyof typeof form) {
    return {
      value: (form[nome] as string) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [nome]: e.target.value })),
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (editando) await actualizar.mutateAsync({ id: Number(id), payload: form })
      else await criar.mutateAsync(form)
      navigate('/paroquias')
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível guardar a paróquia.'))
    }
  }

  return (
    <FormShell
      titulo={editando ? 'Editar Paróquia' : 'Nova Paróquia'}
      voltarHref="/paroquias"
      onSubmit={handleSubmit}
      submitting={criar.isPending || actualizar.isPending}
      erro={erro}
    >
      <Campo label="Nome"><TextField required {...campo('nome')} /></Campo>
      <Campo label="Endereço"><TextField {...campo('endereco')} /></Campo>
      <Campo label="Vigararia">
        <SelectField
          required
          value={form.vigararia_id || ''}
          onChange={(e) => setForm((f) => ({ ...f, vigararia_id: Number(e.target.value) }))}
        >
          <option value="">-- Seleccionar --</option>
          {vigararias?.map((v) => (
            <option key={v.id} value={v.id}>{v.nome}</option>
          ))}
        </SelectField>
      </Campo>
      <Campo label="Pároco"><TextField {...campo('paroco')} /></Campo>
      <Campo label="Telefone"><TextField type="tel" {...campo('telefone')} /></Campo>
      <Campo label="E-mail"><TextField type="email" {...campo('email')} /></Campo>
    </FormShell>
  )
}
