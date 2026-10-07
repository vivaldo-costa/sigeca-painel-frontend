import { useState, useEffect } from 'react'
import { Loader2, Save, Upload, Download, Eye, IdCard, Image as ImageIcon, Users, CircleCheck, CircleX, CircleSlash } from 'lucide-react'
import {
  useCartaoModelo, useAtualizarCartaoModelo, useAtualizarLogoCartao,
  useAtualizarImagemFundoCartao, useCartaoEstatisticas,
} from '@/hooks/useCartaoModelo'
import { useAuthStore } from '@/store/auth'
import { getApiErrorMessage } from '@/lib/api'
import { uploadUrl } from '@/lib/uploads'
import { baixarFicheiroProtegido, visualizarFicheiroProtegido } from '@/lib/download'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import type { CartaoModelo } from '@/types/cartaoModelo'
import { notificar } from '@/lib/notificar'

const CAMPOS_VISIBILIDADE: { chave: keyof CartaoModelo; label: string }[] = [
  { chave: 'mostrar_diocese', label: 'Diocese' },
  { chave: 'mostrar_vigararia', label: 'Vigararia/Zona' },
  { chave: 'mostrar_categoria', label: 'Categoria/Secção' },
  { chave: 'mostrar_agrupamento', label: 'Agrupamento' },
  { chave: 'mostrar_grupo_sanguineo', label: 'Grupo Sanguíneo' },
  { chave: 'mostrar_ano_escutista', label: 'Ano Escutista / Validade' },
]

/**
 * Gestão do modelo do Cartão de Associado — permite ao administrador
 * definir a cor do texto, a imagem de fundo, os textos e os campos
 * visíveis do cartão gerado em PDF (frente + verso), sem depender de
 * alteração de código.
 */
export function CartaoModeloPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useCartaoModelo()
  const { data: estatisticas, isLoading: aCarregarEstatisticas } = useCartaoEstatisticas()
  const atualizar = useAtualizarCartaoModelo()
  const atualizarLogo = useAtualizarLogoCartao()
  const atualizarImagemFundo = useAtualizarImagemFundoCartao()

  const [form, setForm] = useState<Partial<CartaoModelo>>({})
  const [logoFalhou, setLogoFalhou] = useState(false)
  const [fundoFalhou, setFundoFalhou] = useState(false)
  const [aPreVisualizar, setAPreVisualizar] = useState<'ver' | 'baixar' | null>(null)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const somenteLeitura = user?.perfil_nome !== 'ADMIN' && user?.perfil_nome !== 'DIRIGENTE'

  async function handleGuardar() {
    try {
      await atualizar.mutateAsync(form)
      notificar.sucesso('Modelo de cartão guardado com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o modelo.'))
    }
  }

  function handleEscolherLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) atualizarLogo.mutate(ficheiro)
    e.target.value = ''
  }

  function handleEscolherFundo(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) atualizarImagemFundo.mutate(ficheiro)
    e.target.value = ''
  }

  async function handlePreVisualizar(modo: 'ver' | 'baixar') {
    if (!user) return
    setAPreVisualizar(modo)
    try {
      if (modo === 'ver') {
        await visualizarFicheiroProtegido(`/cartao/pdf?id=${user.id}&inline=1`)
      } else {
        await baixarFicheiroProtegido(`/cartao/pdf?id=${user.id}`, 'pre-visualizacao-cartao.pdf')
      }
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível gerar a pré-visualização. Confirma que tens um cartão emitido.'))
    } finally {
      setAPreVisualizar(null)
    }
  }

  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-[15px] font-semibold text-text"><IdCard className="size-4.5" /> Modelo de Cartão</h1>
          <p className="text-[12.5px] text-subtle">Define a cor do texto, a imagem de fundo, os textos e os campos do Cartão de Associado gerado em PDF.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreVisualizar('ver')}
            disabled={aPreVisualizar !== null}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-bg disabled:opacity-50"
          >
            {aPreVisualizar === 'ver' ? <Loader2 className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />}
            Visualizar
          </button>
          <button
            onClick={() => handlePreVisualizar('baixar')}
            disabled={aPreVisualizar !== null}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-bg disabled:opacity-50"
          >
            {aPreVisualizar === 'baixar' ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            Descarregar
          </button>
        </div>
      </div>

      {somenteLeitura && <div className="mb-4"><Alert variant="warning">Só ADMIN e DIRIGENTE podem alterar o modelo de cartão. Podes consultá-lo.</Alert></div>}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CartaoStatCard icon={Users} label="Total de utilizadores" valor={estatisticas?.total_utilizadores} aCarregar={aCarregarEstatisticas} cor="text-text" />
        <CartaoStatCard icon={CircleCheck} label="Cartões gerados" valor={estatisticas?.gerados} aCarregar={aCarregarEstatisticas} cor="text-emerald-600" />
        <CartaoStatCard icon={CircleSlash} label="Sem cartão gerado" valor={estatisticas?.nao_gerados} aCarregar={aCarregarEstatisticas} cor="text-amber-600" />
        <CartaoStatCard icon={CircleX} label="Cartões expirados" valor={estatisticas?.expirados} aCarregar={aCarregarEstatisticas} cor="text-red-600" />
      </div>

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Logótipo do cartão</p>
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center overflow-hidden rounded-full bg-bg">
            {data.logo_path && !logoFalhou ? (
              <img src={uploadUrl('cartao', data.logo_path) ?? ''} alt="Logótipo" className="size-full object-cover" onError={() => setLogoFalhou(true)} />
            ) : (
              <span className="text-[10px] text-subtle">Sem logótipo</span>
            )}
          </div>
          {!somenteLeitura && (
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-text hover:bg-bg">
              <Upload className="size-3.5" /> Trocar logótipo
              <input type="file" accept="image/*" className="hidden" onChange={handleEscolherLogo} />
            </label>
          )}
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-1 text-[12.5px] font-semibold text-muted">Imagem de fundo do cartão</p>
        <p className="mb-3 text-[11.5px] text-subtle">
          Formatos aceites: JPEG, PNG ou WEBP, até 8&nbsp;MB. Para melhor nitidez, usa uma imagem com a mesma proporção do cartão
          (85,6&nbsp;×&nbsp;54&nbsp;mm — ex.: 1012&nbsp;×&nbsp;638&nbsp;px ou maior) — a imagem é cortada centralmente se a proporção não bater certo.
          Se não enviares nenhuma, é usado o fundo azul-marinho por defeito.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-16 w-[101px] shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-bg">
            {data.imagem_fundo_path && !fundoFalhou ? (
              <img src={uploadUrl('cartao', data.imagem_fundo_path) ?? ''} alt="Fundo do cartão" className="size-full object-cover" onError={() => setFundoFalhou(true)} />
            ) : (
              <ImageIcon className="size-5 text-subtle" />
            )}
          </div>
          {!somenteLeitura && (
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-text hover:bg-bg">
              <Upload className="size-3.5" /> Trocar imagem de fundo
              <input type="file" accept="image/*" className="hidden" onChange={handleEscolherFundo} />
            </label>
          )}
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Textos</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-subtle">Título</label>
            <input
              value={form.titulo ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              disabled={somenteLeitura}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-subtle">Subtítulo</label>
            <input
              value={form.subtitulo ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, subtitulo: e.target.value }))}
              disabled={somenteLeitura}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-subtle">E-mail de contacto</label>
            <input
              value={form.email_contacto ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, email_contacto: e.target.value }))}
              disabled={somenteLeitura}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-subtle">Website</label>
            <input
              value={form.website ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              disabled={somenteLeitura}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-[11px] font-medium text-subtle">Endereço</label>
            <input
              value={form.endereco ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
              disabled={somenteLeitura}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-[11px] font-medium text-subtle">Texto legal (verso do cartão)</label>
            <textarea
              value={form.texto_verso ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, texto_verso: e.target.value }))}
              disabled={somenteLeitura}
              rows={3}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
            />
          </div>
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Cor da letra</p>
        <div className="flex flex-col gap-1 sm:w-64">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.cor_texto ?? '#ffffff'}
              onChange={(e) => setForm((f) => ({ ...f, cor_texto: e.target.value }))}
              disabled={somenteLeitura}
              className="size-8 shrink-0 cursor-pointer rounded border border-border disabled:cursor-not-allowed"
            />
            <input
              value={form.cor_texto ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, cor_texto: e.target.value }))}
              disabled={somenteLeitura}
              className="w-full rounded-lg border border-border px-2 py-1.5 font-mono text-[12px] outline-none focus:border-[#111827] disabled:bg-bg disabled:text-muted"
            />
          </div>
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Campos visíveis</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {CAMPOS_VISIBILIDADE.map((campo) => (
            <label key={campo.chave} className="flex items-center gap-2 text-[12.5px] text-text">
              <input
                type="checkbox"
                checked={Boolean(form[campo.chave])}
                onChange={(e) => setForm((f) => ({ ...f, [campo.chave]: e.target.checked ? 1 : 0 }))}
                disabled={somenteLeitura}
                className="size-4 rounded border-border"
              />
              {campo.label}
            </label>
          ))}
        </div>
      </Card>

      {!somenteLeitura && (
        <button onClick={handleGuardar} disabled={atualizar.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
          {atualizar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-3.5" />}
          Guardar Modelo
        </button>
      )}
    </div>
  )
}

function CartaoStatCard({ icon: Icon, label, valor, aCarregar, cor }: {
  icon: typeof Users
  label: string
  valor: number | undefined
  aCarregar: boolean
  cor: string
}) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-2 text-[11.5px] font-medium text-subtle">
        <Icon className={`size-3.5 ${cor}`} /> {label}
      </div>
      <p className={`mt-1.5 text-xl font-bold ${cor}`}>
        {aCarregar ? <Loader2 className="size-4 animate-spin text-subtle" /> : (valor ?? '—')}
      </p>
    </Card>
  )
}
