import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { api, getApiErrorMessage } from '@/lib/api'
import logo from '@/assets/sigeca-logo.svg'

export function RedefinirPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    if (novaSenha !== confirmar) {
      setErro('As duas passwords têm de ser iguais.')
      return
    }
    setEnviando(true)
    try {
      await api.post('/auth/redefinir-password', { token, novaSenha })
      navigate('/login?redefinida=1', { replace: true })
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível redefinir a password.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-pn)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="SIGECA" className="mb-4 h-9" />
          <h1 className="text-lg font-bold text-text">Definir nova password</h1>
        </div>

        {!token ? (
          <>
            <Alert variant="error">Este link não é válido. Pede uma nova recuperação de acesso.</Alert>
            <Link to="/recuperar" className="mt-6 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-muted underline underline-offset-2">
              <ArrowLeft className="size-3.5" /> Pedir novo link
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {erro && <div className="mb-4"><Alert variant="error">{erro}</Alert></div>}
            <Input
              id="novaSenha"
              type="password"
              label="Nova password"
              icon={<Lock className="size-4" />}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <Input
              id="confirmar"
              type="password"
              label="Confirmar password"
              icon={<Lock className="size-4" />}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
            <Button type="submit" size="lg" className="mt-2 w-full" loading={enviando}>
              Redefinir password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
