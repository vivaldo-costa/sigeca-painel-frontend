import { useState, useEffect } from 'react'
import { Loader2, Save, Upload } from 'lucide-react'
import { useConfiguracoesAparencia, useAtualizarCoresTema, useAtualizarLogo } from '@/hooks/useConfiguracoesAparencia'
import { useAuthStore } from '@/store/auth'
import { getApiErrorMessage } from '@/lib/api'
import { uploadUrl } from '@/lib/uploads'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { TIPOS_LOGO, type ConfiguracoesAparencia, type TemaSigeca } from '@/types/configuracoesAparencia'
import { notificar } from '@/lib/notificar'

const CAMPOS_COR: { chave: keyof ConfiguracoesAparencia; label: string }[] = [
  { chave: 'cor_primaria', label: 'Cor Primária' },
  { chave: 'cor_secundaria', label: 'Cor Secundária' },
  { chave: 'cor_destaque', label: 'Cor de Destaque' },
  { chave: 'cor_estado_sucesso', label: 'Sucesso' },
  { chave: 'cor_estado_erro', label: 'Erro' },
  { chave: 'cor_estado_aviso', label: 'Aviso' },
  { chave: 'cor_estado_info', label: 'Informação' },
]

export function ConfiguracoesAparenciaPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useConfiguracoesAparencia()
  const atualizarCores = useAtualizarCoresTema()
  const atualizarLogo = useAtualizarLogo()

  const [cores, setCores] = useState<Record<string, string>>({})
  const [tema, setTema] = useState<TemaSigeca>('claro')
  const [logosComFalha, setLogosComFalha] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (data) {
      setCores({
        cor_primaria: data.cor_primaria, cor_secundaria: data.cor_secundaria, cor_destaque: data.cor_destaque,
        cor_estado_sucesso: data.cor_estado_sucesso, cor_estado_erro: data.cor_estado_erro,
        cor_estado_aviso: data.cor_estado_aviso, cor_estado_info: data.cor_estado_info,
      })
      setTema(data.tema)
    }
  }, [data])

  const somenteLeitura = user?.perfil_nome !== 'ADMIN'

  async function handleGuardarCores() {
    try {
      await atualizarCores.mutateAsync({ ...cores, tema })
      notificar.sucesso('Aparência guardada com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  function handleEscolherLogo(tipo: string, e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) atualizarLogo.mutate({ tipo, ficheiro })
    e.target.value = ''
  }

  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div>

      {somenteLeitura && <div className="mb-4"><Alert variant="warning">Só o Administrador pode alterar a aparência. Podes consultá-la.</Alert></div>}

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Logótipos</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TIPOS_LOGO.map((tipo) => {
            const caminho = data[`${tipo.chave}_path` as keyof ConfiguracoesAparencia] as string | null
            const falhou = logosComFalha.has(tipo.chave)
            return (
              <div key={tipo.chave} className="flex flex-col items-center gap-2 rounded-lg bg-bg p-3">
                <div className="grid h-14 w-full place-items-center overflow-hidden rounded bg-white">
                  {caminho && !falhou ? (
                    <img
                      src={uploadUrl('aparencia', caminho) ?? ''}
                      alt={tipo.label}
                      className="max-h-full max-w-full object-contain"
                      onError={() => setLogosComFalha((s) => new Set(s).add(tipo.chave))}
                    />
                  ) : (
                    <span className="text-[10px] text-subtle">{caminho && falhou ? 'Falha ao carregar' : 'Sem imagem'}</span>
                  )}
                </div>
                <p className="text-center text-[11px] font-medium text-text">{tipo.label}</p>
                {!somenteLeitura && (
                  <label className="flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1 text-[10.5px] font-medium text-text hover:bg-white">
                    <Upload className="size-3" /> Trocar
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleEscolherLogo(tipo.chave, e)} />
                  </label>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Cores</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CAMPOS_COR.map((campo) => (
            <div key={campo.chave} className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-subtle">{campo.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cores[campo.chave] ?? '#000000'}
                  onChange={(e) => setCores((c) => ({ ...c, [campo.chave]: e.target.value }))}
                  disabled={somenteLeitura}
                  className="size-8 shrink-0 cursor-pointer rounded border border-border disabled:cursor-not-allowed"
                />
                <input
                  value={cores[campo.chave] ?? ''}
                  onChange={(e) => setCores((c) => ({ ...c, [campo.chave]: e.target.value }))}
                  disabled={somenteLeitura}
                  className="w-full rounded-lg border border-border px-2 py-1.5 font-mono text-[12px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Tema</p>
        <select
          value={tema}
          onChange={(e) => setTema(e.target.value as TemaSigeca)}
          disabled={somenteLeitura}
          className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
        >
          <option value="claro">Claro</option>
          <option value="escuro">Escuro</option>
          <option value="automatico">Automático</option>
        </select>
      </Card>

      {!somenteLeitura && (
        <button onClick={handleGuardarCores} disabled={atualizarCores.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
          {atualizarCores.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-3.5" />}
          Guardar Cores e Tema
        </button>
      )}
    </div>
  )
}
