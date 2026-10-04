import { useState, useEffect } from 'react'
import { Loader2, Save, Send } from 'lucide-react'
import { useConfiguracaoSms, useAtualizarConfiguracaoSms, useEnviarSmsTeste } from '@/hooks/useConfiguracaoSms'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Campo, Linha2, TextField } from '@/components/crud/FormShell'
import type { ConfiguracaoSmsPayload } from '@/types/configuracaoSms'
import { notificar } from '@/lib/notificar'

export function ConfiguracaoSmsPage() {
  const { data, isLoading } = useConfiguracaoSms()
  const atualizar = useAtualizarConfiguracaoSms()
  const enviarTeste = useEnviarSmsTeste()

  const [form, setForm] = useState<ConfiguracaoSmsPayload>({})
  const [novaApiKey, setNovaApiKey] = useState('')
  const [destinatarioTeste, setDestinatarioTeste] = useState('')

  useEffect(() => {
    if (data) {
      setForm({
        activo: !!data.activo, fornecedor: data.fornecedor, api_url: data.api_url ?? '',
        username: data.username ?? '', remetente: data.remetente ?? '',
      })
    }
  }, [data])

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = { ...form, ...(novaApiKey ? { api_key: novaApiKey } : {}) }
      await atualizar.mutateAsync(payload)
      setNovaApiKey('')
      notificar.sucesso('Configuração guardada com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  async function handleEnviarTeste() {
    if (!destinatarioTeste) { notificar.erro('Indica o número de telefone do teste.'); return }
    try {
      const resultado = await enviarTeste.mutateAsync(destinatarioTeste)
      notificar.sucesso(resultado.mensagem)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível enviar o SMS de teste.'))
    }
  }

  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div>
      <Alert variant="warning">
        Implementado pelo padrão da Africa's Talking (username + API key) — o gateway SMS mais usado em África. Se o fornecedor escolhido tiver uma API diferente, é preciso um ajuste no código de envio antes de activar isto a sério.
      </Alert>

      <div className="mt-4">

        <form onSubmit={handleGuardar}>
          <Card className="mb-4 p-4">
            <label className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-muted">
              <input type="checkbox" checked={!!form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} className="size-4" />
              Usar esta configuração (em vez do modo de simulação)
            </label>

            <Linha2>
              <Campo label="Username"><TextField value={form.username ?? ''} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} /></Campo>
              <Campo label={data.tem_api_key ? 'API Key (preenchida — só muda se escreveres uma nova)' : 'API Key'}>
                <TextField type="password" value={novaApiKey} onChange={(e) => setNovaApiKey(e.target.value)} placeholder={data.tem_api_key ? '••••••••' : ''} />
              </Campo>
            </Linha2>

            <Linha2>
              <Campo label="Remetente (Sender ID)"><TextField value={form.remetente ?? ''} onChange={(e) => setForm((f) => ({ ...f, remetente: e.target.value }))} placeholder="SIGECA" /></Campo>
              <Campo label="URL da API (opcional — só se o fornecedor usar um endpoint diferente do padrão)">
                <TextField value={form.api_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, api_url: e.target.value }))} placeholder="https://api.africastalking.com/version1/messaging" />
              </Campo>
            </Linha2>
          </Card>

          <button type="submit" disabled={atualizar.isPending} className="mb-4 flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
            {atualizar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-3.5" />}
            Guardar Configuração
          </button>
        </form>

        <Card className="p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-muted">Enviar SMS de Teste</p>
          <div className="flex gap-2">
            <input
              value={destinatarioTeste} onChange={(e) => setDestinatarioTeste(e.target.value)}
              placeholder="+244923000000"
              className="w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
            />
            <button onClick={handleEnviarTeste} disabled={enviarTeste.isPending} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text transition-colors hover:bg-bg disabled:opacity-50">
              {enviarTeste.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
              Enviar Teste
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
