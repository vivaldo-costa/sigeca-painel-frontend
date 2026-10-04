import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useConfiguracoesGerais, useAtualizarConfiguracoesGerais } from '@/hooks/useConfiguracoesGerais'
import { useAuthStore } from '@/store/auth'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Campo, Linha2, TextField } from '@/components/crud/FormShell'
import type { ConfiguracoesGeraisPayload } from '@/types/configuracoesGerais'
import { notificar } from '@/lib/notificar'

export function ConfiguracoesGeraisPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useConfiguracoesGerais()
  const atualizar = useAtualizarConfiguracoesGerais()

  const [form, setForm] = useState<ConfiguracoesGeraisPayload>({})

  useEffect(() => {
    if (data) {
      setForm({
        nome_instituicao: data.nome_instituicao, sigla: data.sigla, endereco: data.endereco ?? '',
        telefone: data.telefone ?? '', email: data.email ?? '', website: data.website ?? '',
        facebook: data.facebook ?? '', instagram: data.instagram ?? '', youtube: data.youtube ?? '',
        rodape: data.rodape ?? '', idioma: data.idioma, formato_data: data.formato_data, fuso_horario: data.fuso_horario,
      })
    }
  }, [data])

  const somenteLeitura = user?.perfil_nome !== 'ADMIN'

  function campo(chave: keyof ConfiguracoesGeraisPayload) {
    return {
      value: (form[chave] as string) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [chave]: e.target.value })),
      disabled: somenteLeitura,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await atualizar.mutateAsync(form)
      notificar.sucesso('Configurações guardadas com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar as configurações.'))
    }
  }

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div>

      {somenteLeitura && <div className="mb-4"><Alert variant="warning">Só o Administrador pode alterar estas configurações. Podes consultá-las.</Alert></div>}

      <form onSubmit={handleSubmit}>
        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Instituição</p>
          <Linha2>
            <Campo label="Nome da instituição"><TextField required {...campo('nome_instituicao')} /></Campo>
            <Campo label="Sigla"><TextField required {...campo('sigla')} /></Campo>
          </Linha2>
          <Campo label="Endereço"><TextField {...campo('endereco')} /></Campo>
          <Linha2>
            <Campo label="Telefone"><TextField {...campo('telefone')} /></Campo>
            <Campo label="E-mail"><TextField type="email" {...campo('email')} /></Campo>
          </Linha2>
          <Campo label="Website"><TextField {...campo('website')} /></Campo>
        </Card>

        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Redes Sociais</p>
          <Campo label="Facebook"><TextField {...campo('facebook')} /></Campo>
          <Campo label="Instagram"><TextField {...campo('instagram')} /></Campo>
          <Campo label="YouTube"><TextField {...campo('youtube')} /></Campo>
        </Card>

        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Regionalização</p>
          <Linha2>
            <Campo label="Idioma"><TextField {...campo('idioma')} /></Campo>
            <Campo label="Fuso horário"><TextField {...campo('fuso_horario')} /></Campo>
          </Linha2>
          <Campo label="Formato de data"><TextField {...campo('formato_data')} /></Campo>
        </Card>

        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Rodapé</p>
          <textarea
            value={form.rodape ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, rodape: e.target.value }))}
            disabled={somenteLeitura}
            rows={2}
            className="w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
          />
        </Card>

        {!somenteLeitura && (
          <button type="submit" disabled={atualizar.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
            {atualizar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-3.5" />}
            Guardar Configurações
          </button>
        )}
      </form>
    </div>
  )
}
