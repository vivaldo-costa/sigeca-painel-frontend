import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { vigarariaHooks, dioceseHooks } from '@/hooks/useEstrutura'
import { getApiErrorMessage } from '@/lib/api'
import { FormShell, Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { Vigararia } from '@/types/estrutura'

const VAZIO: Omit<Vigararia, 'id'> = {
  nome: '', vigario_foraneo: '', diocese_id: 0, coordenador: '',
  telefone_coordenador: '', email_coordenador: '', assistente: '',
  telefone_assistente: '', email_assistente: '', ativa: true,
}

export function VigarariasForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = !!id
  const { data: existente } = vigarariaHooks.useOne(id ? Number(id) : undefined)
  const { data: dioceses } = dioceseHooks.useList()
  const criar = vigarariaHooks.useCreate()
  const actualizar = vigarariaHooks.useUpdate()

  const [form, setForm] = useState<Omit<Vigararia, 'id'>>(VAZIO)
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
      navigate('/vigararias')
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível guardar a vigararia.'))
    }
  }

  return (
    <FormShell
      titulo={editando ? 'Editar Vigararia' : 'Nova Vigararia'}
      voltarHref="/vigararias"
      onSubmit={handleSubmit}
      submitting={criar.isPending || actualizar.isPending}
      erro={erro}
    >
      <Campo label="Nome"><TextField required {...campo('nome')} /></Campo>
      <Campo label="Vigário Forâneo"><TextField required {...campo('vigario_foraneo')} /></Campo>
      <Campo label="Diocese">
        <SelectField
          required
          value={form.diocese_id || ''}
          onChange={(e) => setForm((f) => ({ ...f, diocese_id: Number(e.target.value) }))}
        >
          <option value="">-- Seleccionar --</option>
          {dioceses?.map((d) => (
            <option key={d.id} value={d.id}>{d.nome}</option>
          ))}
        </SelectField>
      </Campo>
      <Campo label="Coordenador"><TextField required {...campo('coordenador')} /></Campo>
      <Linha2>
        <Campo label="Telefone do Coordenador"><TextField type="tel" {...campo('telefone_coordenador')} /></Campo>
        <Campo label="E-mail do Coordenador"><TextField type="email" {...campo('email_coordenador')} /></Campo>
      </Linha2>
      <Campo label="Assistente"><TextField {...campo('assistente')} /></Campo>
      <Linha2>
        <Campo label="Telefone do Assistente"><TextField type="tel" {...campo('telefone_assistente')} /></Campo>
        <Campo label="E-mail do Assistente"><TextField type="email" {...campo('email_assistente')} /></Campo>
      </Linha2>
      <Campo label="Estado">
        <SelectField
          value={form.ativa ? '1' : '0'}
          onChange={(e) => setForm((f) => ({ ...f, ativa: e.target.value === '1' }))}
        >
          <option value="1">Activa</option>
          <option value="0">Inactiva</option>
        </SelectField>
      </Campo>
    </FormShell>
  )
}
