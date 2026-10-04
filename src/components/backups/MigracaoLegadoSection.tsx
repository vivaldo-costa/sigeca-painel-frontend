import { useState, useRef } from 'react'
import { Upload, Loader2, ArrowRightLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { useAnalisarLegado, useImportarLegado } from '@/hooks/useMigracaoLegado'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import type { AnaliseLegado, ResultadoImportacaoLegado } from '@/types/migracaoLegado'
import { notificar } from '@/lib/notificar'

export function MigracaoLegadoSection() {
  const inputRef = useRef<HTMLInputElement>(null)
  const analisar = useAnalisarLegado()
  const importar = useImportarLegado()

  const [analise, setAnalise] = useState<AnaliseLegado | null>(null)
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [substituir, setSubstituir] = useState(false)
  const [resultado, setResultado] = useState<ResultadoImportacaoLegado | null>(null)

  async function handleEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    e.target.value = ''
    if (!ficheiro) return
    setResultado(null)
    try {
      const dados = await analisar.mutateAsync(ficheiro)
      setAnalise(dados)
      setSeleccionadas(new Set())
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível analisar o ficheiro.'))
    }
  }

  function alternarTabela(nome: string) {
    setSeleccionadas((atual) => {
      const novo = new Set(atual)
      if (novo.has(nome)) novo.delete(nome)
      else novo.add(nome)
      return novo
    })
  }

  async function handleImportar() {
    if (!analise || seleccionadas.size === 0) return
    try {
      const dados = await importar.mutateAsync({ sessao: analise.sessao, tabelas: Array.from(seleccionadas), substituirExistentes: substituir })
      setResultado(dados)
      setAnalise(null)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível importar as tabelas seleccionadas.'))
    }
  }

  function recomecar() {
    setAnalise(null)
    setResultado(null)
    setSeleccionadas(new Set())
  }

  return (
    <Card className="p-4">
      <p className="mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
        <ArrowRightLeft className="size-3.5" /> Migração Guiada
      </p>
      <p className="mb-3 text-[12px] text-subtle">
        Envia um ficheiro .sql de um sistema antigo — o SIGECA mostra as tabelas que encontrar lá dentro (com o
        número real de linhas de cada uma), e só as que escolheres entram no sistema. Entram sempre com o prefixo{' '}
        <span className="font-mono">legado_</span>, nunca a sobrepor nenhuma tabela existente.
      </p>


      {!analise && !resultado && (
        <>
          <input ref={inputRef} type="file" accept=".sql" className="hidden" onChange={handleEscolherFicheiro} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={analisar.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold text-text hover:bg-bg disabled:opacity-50"
          >
            {analisar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-3.5" />}
            {analisar.isPending ? 'A analisar (pode demorar num ficheiro grande)...' : 'Escolher Ficheiro .sql'}
          </button>
        </>
      )}

      {analise && (
        <div>
          <p className="mb-2 text-[12.5px] font-medium text-text">
            {analise.tabelas.length} tabela(s) encontrada(s) — escolhe as que queres trazer:
          </p>
          <div className="mb-3 max-h-72 overflow-y-auto rounded-lg border border-border">
            {analise.tabelas.map((t) => (
              <label key={t.nome} className="flex cursor-pointer items-center justify-between border-b border-border px-3 py-2 last:border-0 hover:bg-bg">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={seleccionadas.has(t.nome)} onChange={() => alternarTabela(t.nome)} />
                  <span className="font-mono text-[12.5px] text-text">{t.nome}</span>
                </span>
                <span className="text-[11px] text-subtle">{t.total_linhas.toLocaleString('pt-PT')} linhas · {t.colunas.length} colunas</span>
              </label>
            ))}
          </div>
          <label className="mb-3 flex items-center gap-2 text-[12px] text-muted">
            <input type="checkbox" checked={substituir} onChange={(e) => setSubstituir(e.target.checked)} />
            Substituir se já existir uma <span className="font-mono">legado_*</span> desta tabela, de uma importação anterior
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleImportar}
              disabled={seleccionadas.size === 0 || importar.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {importar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {importar.isPending ? 'A importar...' : `Importar ${seleccionadas.size} tabela(s)`}
            </button>
            <button onClick={recomecar} className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-bg">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <div>
          {resultado.importadas.length > 0 && (
            <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] text-badge-green-text">
              <CheckCircle2 className="size-4" /> Importadas: {resultado.importadas.map((t) => `legado_${t}`).join(', ')}
            </p>
          )}
          {resultado.ignoradas_ja_existentes.length > 0 && (
            <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] text-badge-orange-text">
              <AlertTriangle className="size-4" /> Já existiam, e não foram substituídas: {resultado.ignoradas_ja_existentes.join(', ')}
            </p>
          )}
          {resultado.falhas.length > 0 && (
            <div className="mb-1.5 space-y-1">
              {resultado.falhas.map((f) => (
                <p key={f.tabela} className="flex items-center gap-1.5 text-[12.5px] text-badge-red-text">
                  <XCircle className="size-4" /> {f.tabela}: {f.erro}
                </p>
              ))}
            </div>
          )}
          <button onClick={recomecar} className="mt-2 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-bg">
            Nova Migração
          </button>
        </div>
      )}
    </Card>
  )
}
