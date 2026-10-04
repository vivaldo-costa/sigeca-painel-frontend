import { type FormEvent, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { IdCard, Lock, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useAuthStore } from '@/store/auth'
import { CampoCaptcha } from '@/components/auth/CampoCaptcha'
import { useAparenciaGlobal } from '@/hooks/useAparenciaGlobal'
import { uploadUrl } from '@/lib/uploads'
import logo from '@/assets/sigeca-logo.svg'

/**
 * Login do Painel — mesmo endpoint /auth/login e mesma sessão do Portal do
 * Escuteiro (index.php é idêntico nos dois). Aqui simplificado: um único
 * painel central, sem o hero de estatísticas do Portal, porque este é o
 * ponto de entrada de uso interno (dirigentes), não de marca pública.
 */
export function LoginPage() {
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaResposta, setCaptchaResposta] = useState('')
  const [codigo2fa, setCodigo2fa] = useState('')
  const { login, verificarSegundoFactor, status, error, captchaExigido } = useAuthStore()
  const estaCarregando = status === 'loading'
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const aparencia = useAparenciaGlobal()
  const [logoFalhou, setLogoFalhou] = useState(false)
  const logoLogin = !logoFalhou ? (uploadUrl('aparencia', aparencia?.logo_login_path) ?? logo) : logo

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await login({ identificador, senha, ...(captchaExigido ? { captchaToken, captchaResposta } : {}) })
    if (ok) navigate(params.get('redirect') ?? '/dashboard', { replace: true })
  }

  async function handleSubmit2fa(e: FormEvent) {
    e.preventDefault()
    const ok = await verificarSegundoFactor(codigo2fa)
    if (ok) navigate(params.get('redirect') ?? '/dashboard', { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-pn)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logoLogin} alt="SIGECA" className="mb-4 h-9" onError={() => setLogoFalhou(true)} />
          <h1 className="text-lg font-bold text-text">Painel de Gestão</h1>
          <p className="mt-1 text-[13px] text-muted">
            {status === 'aguarda2fa' ? 'Confirmação em duas etapas' : 'Acesso reservado a dirigentes autorizados'}
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {status === 'aguarda2fa' ? (
          <form onSubmit={handleSubmit2fa}>
            <p className="mb-4 text-[13px] text-muted">
              Introduz o código de 6 dígitos da tua app de autenticação, ou um dos teus códigos de recuperação.
            </p>
            <Input
              id="codigo2fa"
              label="Código"
              icon={<ShieldCheck className="size-4" />}
              placeholder="000000"
              autoComplete="one-time-code"
              autoFocus
              required
              value={codigo2fa}
              onChange={(e) => setCodigo2fa(e.target.value)}
            />
            <Button type="submit" size="lg" className="mt-2 w-full" loading={estaCarregando}>
              Confirmar
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              id="identificador"
              label="Nº SIGECA ou e-mail"
              icon={<IdCard className="size-4" />}
              placeholder="LA1006001"
              autoComplete="username"
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
            />
            <Input
              id="senha"
              type="password"
              label="Palavra-passe"
              icon={<Lock className="size-4" />}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {captchaExigido && (
              <CampoCaptcha onToken={setCaptchaToken} resposta={captchaResposta} onRespostaChange={setCaptchaResposta} />
            )}
            <Button type="submit" size="lg" className="mt-2 w-full" loading={estaCarregando}>
              Entrar
            </Button>
            <Link to="/recuperar" className="mt-4 block text-center text-[12.5px] font-medium text-muted underline underline-offset-2">
              Esqueceste a palavra-passe? Recuperar acesso
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
