import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dioceseHooks } from '@/hooks/useEstrutura'
import { getApiErrorMessage } from '@/lib/api'
import { FormShell, Campo, Linha2, TextField } from '@/components/crud/FormShell'
import type { Diocese } from '@/types/estrutura'

const VAZIO = {
  nome: '', bispo: '', cidade: '', ab_diocese: '', coordenador: '',
  telefone_coordenador: '', email_coordenador: '', assistente: '',
  telefone_assistente: '', email_assistente: '',
}

export function DiocesesForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = !!id
  const { data: existente } = dioceseHooks.useOne(id ? Number(id) : undefined)
  const criar = dioceseHooks.useCreate()
  const actualizar = dioceseHooks.useUpdate()

  const [form, setForm] = useState<Omit<Diocese, 'id'>>(VAZIO)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (existente) setForm(existente)
  }, [existente])

  function campo(nome: keyof typeof form) {
    return {
      value: form[nome] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [nome]: e.target.value })),
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    try {
      if (editando) await actualizar.mutateAsync({ id: Number(id), payload: form })
      else await criar.mutateAsync(form)
      navigate('/dioceses')
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível guardar a diocese.'))
    }
  }

  return (
    <FormShell
      titulo={editando ? 'Editar Diocese' : 'Nova Diocese'}
      voltarHref="/dioceses"
      onSubmit={handleSubmit}
      submitting={criar.isPending || actualizar.isPending}
      erro={erro}
    >
      <Campo label="Nome da diocese"><TextField required {...campo('nome')} /></Campo>
      <Campo label="Bispo Diocesano"><TextField required {...campo('bispo')} /></Campo>
      <Linha2>
        <Campo label="Cidade"><TextField {...campo('cidade')} /></Campo>
        <Campo label="Abreviatura"><TextField required maxLength={2} {...campo('ab_diocese')} /></Campo>
      </Linha2>
      <Campo label="Coordenador"><TextField required {...campo('coordenador')} /></Campo>
      <Linha2>
        <Campo label="Telefone do Coordenador"><TextField required {...campo('telefone_coordenador')} /></Campo>
        <Campo label="E-mail do Coordenador"><TextField type="email" required {...campo('email_coordenador')} /></Campo>
      </Linha2>
      <Campo label="Assistente"><TextField required {...campo('assistente')} /></Campo>
      <Linha2>
        <Campo label="Telefone do Assistente"><TextField required {...campo('telefone_assistente')} /></Campo>
        <Campo label="E-mail do Assistente"><TextField type="email" required {...campo('email_assistente')} /></Campo>
      </Linha2>
    </FormShell>
  )
}
