import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { api, getApiErrorMessage } from '@/lib/api'
import logo from '@/assets/sigeca-logo.svg'

export function RecuperarPage() {
  const [identificador, setIdentificador] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      const { data } = await api.post('/auth/recuperar', { identificador, app: 'painel' })
      setMensagem(data.mensagem)
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível processar o pedido.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-pn)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="SIGECA" className="mb-4 h-9" />
          <h1 className="text-lg font-bold text-text">Recuperar acesso</h1>
          <p className="mt-1 text-[13px] text-muted">
            Indica o teu número SIGECA ou e-mail — se existir uma conta, vais receber um link para definires uma nova palavra-passe.
          </p>
        </div>

        {mensagem ? (
          <Alert variant="success">{mensagem}</Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            {erro && <div className="mb-4"><Alert variant="error">{erro}</Alert></div>}
            <Input
              id="identificador"
              label="Nº SIGECA ou e-mail"
              icon={<Mail className="size-4" />}
              placeholder="LA1006001"
              autoComplete="username"
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
            />
            <Button type="submit" size="lg" className="mt-2 w-full" loading={enviando}>
              Enviar link de recuperação
            </Button>
          </form>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-muted underline underline-offset-2">
          <ArrowLeft className="size-3.5" /> Voltar ao início de sessão
        </Link>
      </div>
    </div>
  )
}
