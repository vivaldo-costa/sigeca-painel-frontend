import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, FileBadge2, Loader2, Save } from 'lucide-react'
import {
  useModelosCertificado, useGuardarModeloCertificado, preVisualizarModeloCertificado, type ModeloCertificado,
} from '@/hooks/useCertificados'
import { usePermissao } from '@/hooks/usePermissao'
import { Campo, Linha2, TextField, SelectField, TextareaField } from '@/components/crud/FormShell'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { cn } from '@/lib/cn'

const TIPOS: { valor: ModeloCertificado['tipo']; label: string }[] = [
  { valor: 'certificado', label: 'Certificado' },
  { valor: 'declaracao', label: 'Declaração' },
  { valor: 'diploma', label: 'Diploma' },
]

const MARCADORES = ['{nome}', '{codigo}', '{titulo}', '{tipo}', '{numero}', '{data_emissao}', '{validade}']

/**
 * Modelos (templates) da Certificação Digital — um por tipo de documento.
 * Textos, cores, orientação, assinaturas, logótipo e imagem de fundo; o
 * PDF dos documentos emitidos passa a seguir o modelo do respectivo tipo.
 */
export function CertificadoModelosPage() {
  const { data, isLoading } = useModelosCertificado()
  const guardar = useGuardarModeloCertificado()
  const { editar: podeEditar } = usePermissao('Certificados')
  const [tipo, setTipo] = useState<ModeloCertificado['tipo']>('certificado')
  const [form, setForm] = useState<ModeloCertificado | null>(null)
  const [logotipo, setLogotipo] = useState<File | null>(null)
  const [fundo, setFundo] = useState<File | null>(null)
  const [aPreVisualizar, setAPreVisualizar] = useState(false)

  useEffect(() => {
    const modelo = data?.find((m) => m.tipo === tipo)
    if (modelo) setForm({ ...modelo })
    setLogotipo(null)
    setFundo(null)
  }, [data, tipo])

  function alterar<K extends keyof ModeloCertificado>(campo: K, valor: ModeloCertificado[K]) {
    setForm((f) => (f ? { ...f, [campo]: valor } : f))
  }

  async function submeter(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    const fd = new FormData()
    const campos: (keyof ModeloCertificado)[] = [
      'orientacao', 'cor_primaria', 'cor_texto', 'cabecalho', 'subcabecalho', 'titulo_documento', 'texto_introducao',
      'texto_corpo', 'texto_rodape', 'assinatura1_nome', 'assinatura1_cargo', 'assinatura2_nome', 'assinatura2_cargo',
    ]
    campos.forEach((c) => fd.append(c, String(form[c] ?? '')))
    fd.append('mostrar_borda', form.mostrar_borda ? 'true' : 'false')
    fd.append('mostrar_qr', form.mostrar_qr ? 'true' : 'false')
    if (logotipo) fd.append('logotipo', logotipo)
    if (fundo) fd.append('imagem_fundo', fundo)
    if (!form.logotipo && !logotipo) fd.append('remover_logotipo', 'true')
    if (!form.imagem_fundo && !fundo) fd.append('remover_imagem_fundo', 'true')
    try {
      await guardar.mutateAsync({ tipo, form: fd })
      notificar.sucesso('Modelo guardado. Os próximos documentos já usam este modelo.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o modelo.'))
    }
  }

  async function preVisualizar() {
    if (!form) return
    setAPreVisualizar(true)
    try {
      const { logotipo: _l, imagem_fundo: _f, ...textos } = form
      await preVisualizarModeloCertificado(tipo, textos)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível gerar a pré-visualização.'))
    } finally {
      setAPreVisualizar(false)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/certificados" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ArrowLeft className="size-3.5" /> Certificação Digital
      </Link>
      <h1 className="mb-1 flex items-center gap-2.5 text-xl font-bold text-text">
        <FileBadge2 className="size-5 text-muted" /> Modelos dos Documentos
      </h1>
      <p className="mb-5 text-[12.5px] text-subtle">
        Define o aspecto dos certificados, declarações e diplomas. As alterações aplicam-se aos documentos emitidos a partir de agora
        (e aos PDFs que voltarem a ser gerados).
      </p>

      <div className="mb-4 flex gap-1 border-b border-border">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => setTipo(t.valor)}
            className={cn('border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors',
              tipo === t.valor ? 'border-[#111827] text-text' : 'border-transparent text-muted hover:text-text')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(isLoading || !form) && <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-subtle" /></div>}

      {form && (
        <form onSubmit={submeter} className="space-y-4">
          <fieldset disabled={!podeEditar} className="space-y-4">
            <Card>
              <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Aspecto</h3></CardHeader>
              <CardBody className="space-y-4">
                <Linha2>
                  <Campo label="Orientação">
                    <SelectField value={form.orientacao} onChange={(e) => alterar('orientacao', e.target.value as ModeloCertificado['orientacao'])}>
                      <option value="landscape">Horizontal (paisagem)</option>
                      <option value="portrait">Vertical (retrato)</option>
                    </SelectField>
                  </Campo>
                  <div className="grid grid-cols-2 gap-3">
                    <Campo label="Cor principal">
                      <input type="color" value={form.cor_primaria} onChange={(e) => alterar('cor_primaria', e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-border" />
                    </Campo>
                    <Campo label="Cor do texto">
                      <input type="color" value={form.cor_texto} onChange={(e) => alterar('cor_texto', e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-border" />
                    </Campo>
                  </div>
                </Linha2>
                <div className="flex flex-wrap gap-5 text-[12.5px] text-text">
                  <label className="flex items-center gap-2"><input type="checkbox" className="size-3.5" checked={Boolean(form.mostrar_borda)} onChange={(e) => alterar('mostrar_borda', e.target.checked)} /> Mostrar moldura</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="size-3.5" checked={Boolean(form.mostrar_qr)} onChange={(e) => alterar('mostrar_qr', e.target.checked)} /> Mostrar código QR de verificação</label>
                </div>
                <Linha2>
                  <Campo label="Logótipo (PNG/JPG)">
                    <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setLogotipo(e.target.files?.[0] ?? null)} className="block w-full text-[12.5px] text-muted" />
                    {form.logotipo && !logotipo && (
                      <button type="button" onClick={() => alterar('logotipo', null)} className="mt-1 text-[11.5px] text-badge-red-text hover:underline">Remover logótipo actual</button>
                    )}
                  </Campo>
                  <Campo label="Imagem de fundo (PNG/JPG)">
                    <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setFundo(e.target.files?.[0] ?? null)} className="block w-full text-[12.5px] text-muted" />
                    {form.imagem_fundo && !fundo && (
                      <button type="button" onClick={() => alterar('imagem_fundo', null)} className="mt-1 text-[11.5px] text-badge-red-text hover:underline">Remover imagem de fundo actual</button>
                    )}
                  </Campo>
                </Linha2>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Textos</h3></CardHeader>
              <CardBody className="space-y-4">
                <p className="rounded-lg bg-bg px-3 py-2 text-[11.5px] text-muted">
                  Marcadores que podes usar: {MARCADORES.map((m) => <code key={m} className="mx-0.5 rounded bg-white px-1 font-mono">{m}</code>)}
                </p>
                <Campo label="Cabeçalho"><TextField required value={form.cabecalho} onChange={(e) => alterar('cabecalho', e.target.value)} /></Campo>
                <Campo label="Subcabeçalho"><TextField value={form.subcabecalho ?? ''} onChange={(e) => alterar('subcabecalho', e.target.value)} /></Campo>
                <Linha2>
                  <Campo label="Título do documento"><TextField value={form.titulo_documento ?? ''} onChange={(e) => alterar('titulo_documento', e.target.value)} placeholder={TIPOS.find((t) => t.valor === tipo)?.label.toUpperCase()} /></Campo>
                  <Campo label="Introdução"><TextField value={form.texto_introducao} onChange={(e) => alterar('texto_introducao', e.target.value)} /></Campo>
                </Linha2>
                <Campo label="Texto principal">
                  <TextareaField value={form.texto_corpo ?? ''} onChange={(e) => alterar('texto_corpo', e.target.value)} placeholder="Por omissão: {titulo}. Ex.: participou com aproveitamento em {titulo}." />
                </Campo>
                <Campo label="Rodapé"><TextareaField value={form.texto_rodape ?? ''} onChange={(e) => alterar('texto_rodape', e.target.value)} /></Campo>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Assinaturas</h3></CardHeader>
              <CardBody className="space-y-4">
                <Linha2>
                  <Campo label="1ª assinatura — nome"><TextField value={form.assinatura1_nome ?? ''} onChange={(e) => alterar('assinatura1_nome', e.target.value)} /></Campo>
                  <Campo label="1ª assinatura — cargo"><TextField value={form.assinatura1_cargo ?? ''} onChange={(e) => alterar('assinatura1_cargo', e.target.value)} /></Campo>
                </Linha2>
                <Linha2>
                  <Campo label="2ª assinatura — nome"><TextField value={form.assinatura2_nome ?? ''} onChange={(e) => alterar('assinatura2_nome', e.target.value)} /></Campo>
                  <Campo label="2ª assinatura — cargo"><TextField value={form.assinatura2_cargo ?? ''} onChange={(e) => alterar('assinatura2_cargo', e.target.value)} /></Campo>
                </Linha2>
              </CardBody>
            </Card>
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={preVisualizar} loading={aPreVisualizar}><Eye className="size-3.5" /> Pré-visualizar</Button>
            {podeEditar && <Button type="submit" loading={guardar.isPending}><Save className="size-3.5" /> Guardar modelo</Button>}
          </div>
        </form>
      )}
    </div>
  )
}
