import { useState, useEffect } from 'react'
import { Loader2, Save, Send } from 'lucide-react'
import { useConfiguracaoEmail, useAtualizarConfiguracaoEmail, useEnviarEmailTeste } from '@/hooks/useConfiguracaoEmail'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Campo, Linha2, TextField } from '@/components/crud/FormShell'
import type { ConfiguracaoEmailPayload } from '@/types/configuracaoEmail'
import { notificar } from '@/lib/notificar'

export function ConfiguracaoEmailPage() {
  const { data, isLoading } = useConfiguracaoEmail()
  const atualizar = useAtualizarConfiguracaoEmail()
  const enviarTeste = useEnviarEmailTeste()

  const [form, setForm] = useState<ConfiguracaoEmailPayload>({})
  const [novaPassword, setNovaPassword] = useState('')
  const [destinatarioTeste, setDestinatarioTeste] = useState('')

  useEffect(() => {
    if (data) {
      setForm({
        activo: !!data.activo, host: data.host ?? '', porta: data.porta, seguro: !!data.seguro,
        utilizador: data.utilizador ?? '', remetente_nome: data.remetente_nome,
        remetente_email: data.remetente_email ?? '', reply_to: data.reply_to ?? '',
      })
    }
  }, [data])

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = { ...form, ...(novaPassword ? { password: novaPassword } : {}) }
      await atualizar.mutateAsync(payload)
      setNovaPassword('')
      notificar.sucesso('Configuração guardada com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  async function handleEnviarTeste() {
    if (!destinatarioTeste) { notificar.erro('Indica o e-mail de destino do teste.'); return }
    try {
      const resultado = await enviarTeste.mutateAsync(destinatarioTeste)
      notificar.sucesso(resultado.mensagem)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível enviar o e-mail de teste.'))
    }
  }

  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div>


      <form onSubmit={handleGuardar}>
        <Card className="mb-4 p-4">
          <label className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-muted">
            <input type="checkbox" checked={!!form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} className="size-4" />
            Usar esta configuração (em vez das variáveis de ambiente do servidor)
          </label>

          <Linha2>
            <Campo label="Servidor SMTP"><TextField value={form.host ?? ''} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} placeholder="smtp.exemplo.ao" /></Campo>
            <Campo label="Porta"><TextField type="number" value={form.porta ?? ''} onChange={(e) => setForm((f) => ({ ...f, porta: Number(e.target.value) }))} /></Campo>
          </Linha2>

          <label className="mb-3 flex items-center gap-2 text-[12.5px] text-text">
            <input type="checkbox" checked={!!form.seguro} onChange={(e) => setForm((f) => ({ ...f, seguro: e.target.checked }))} className="size-4" />
            TLS/SSL
          </label>

          <Linha2>
            <Campo label="Utilizador"><TextField value={form.utilizador ?? ''} onChange={(e) => setForm((f) => ({ ...f, utilizador: e.target.value }))} /></Campo>
            <Campo label={data.tem_password ? 'Password (preenchida — só muda se escreveres uma nova)' : 'Password'}>
              <TextField type="password" value={novaPassword} onChange={(e) => setNovaPassword(e.target.value)} placeholder={data.tem_password ? '••••••••' : ''} />
            </Campo>
          </Linha2>
        </Card>

        <Card className="mb-4 p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Remetente</p>
          <Linha2>
            <Campo label="Nome do remetente"><TextField value={form.remetente_nome ?? ''} onChange={(e) => setForm((f) => ({ ...f, remetente_nome: e.target.value }))} /></Campo>
            <Campo label="E-mail do remetente"><TextField type="email" value={form.remetente_email ?? ''} onChange={(e) => setForm((f) => ({ ...f, remetente_email: e.target.value }))} /></Campo>
          </Linha2>
          <Campo label="Reply-to (opcional)"><TextField type="email" value={form.reply_to ?? ''} onChange={(e) => setForm((f) => ({ ...f, reply_to: e.target.value }))} /></Campo>
        </Card>

        <button type="submit" disabled={atualizar.isPending} className="mb-4 flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
          {atualizar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-3.5" />}
          Guardar Configuração
        </button>
      </form>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Enviar E-mail de Teste</p>
        <div className="flex gap-2">
          <input
            type="email" value={destinatarioTeste} onChange={(e) => setDestinatarioTeste(e.target.value)}
            placeholder="destinatario@exemplo.com"
            className="w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <button onClick={handleEnviarTeste} disabled={enviarTeste.isPending} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text transition-colors hover:bg-bg disabled:opacity-50">
            {enviarTeste.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
            Enviar Teste
          </button>
        </div>
      </Card>
    </div>
  )
}
