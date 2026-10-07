import { useState, useRef } from 'react'
import { DatabaseBackup, Download, Trash2, Upload, Loader2, PlusCircle } from 'lucide-react'
import { useBackups, useCriarBackup, useRemoverBackup, useImportarBackup, useDownloadBackup } from '@/hooks/useBackups'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { Card } from '@/components/ui/Card'
import { MigracaoLegadoSection } from '@/components/backups/MigracaoLegadoSection'

function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BackupsPage() {
  const { data, isLoading } = useBackups()
  const criar = useCriarBackup()
  const remover = useRemoverBackup()
  const importar = useImportarBackup()
  const baixar = useDownloadBackup()
  const confirmar = useConfirmar()

  const inputFicheiroRef = useRef<HTMLInputElement>(null)
  const [confirmarImportacao, setConfirmarImportacao] = useState<File | null>(null)

  async function handleCriarBackup() {
    try {
      await criar.mutateAsync()
      notificar.sucesso('Backup criado com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível criar o backup.'))
    }
  }

  async function handleRemover(nome: string) {
    const ok = await confirmar({
      titulo: 'Remover backup',
      mensagem: `Remover o backup "${nome}"? Esta acção não pode ser desfeita.`,
      textoConfirmar: 'Remover',
      perigoso: true,
    })
    if (!ok) return
    try {
      await remover.mutateAsync(nome)
      notificar.sucesso('Backup removido.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover o backup.'))
    }
  }

  function handleEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) setConfirmarImportacao(ficheiro)
    e.target.value = ''
  }

  async function handleConfirmarImportacao() {
    if (!confirmarImportacao) return
    try {
      const resultado = await importar.mutateAsync(confirmarImportacao)
      notificar.sucesso(resultado.mensagem)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível importar o ficheiro.'))
    } finally {
      setConfirmarImportacao(null)
    }
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 sm:px-6 sm:py-7">
      <h1 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-text">
        <DatabaseBackup className="size-5 text-muted" /> Backups e Importação
      </h1>


      <Card className="mb-4 p-4">
        <p className="mb-1 text-[12.5px] font-semibold text-muted">Criar Backup</p>
        <p className="mb-3 text-[12px] text-subtle">Gera uma cópia completa da base de dados (estrutura e dados) e disponibiliza-a aqui para descarregar.</p>
        <button onClick={handleCriarBackup} disabled={criar.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
          {criar.isPending ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle className="size-3.5" />}
          {criar.isPending ? 'A criar backup (pode demorar alguns minutos)...' : 'Criar Backup Agora'}
        </button>
      </Card>

      <Card className="mb-4 p-4">
        <p className="mb-1 text-[12.5px] font-semibold text-muted">Importar</p>
        <p className="mb-3 text-[12px] text-subtle">
          Substitui os dados actuais pelo conteúdo do ficheiro .sql enviado. Uma cópia de segurança do estado
          actual é criada automaticamente antes de qualquer importação — se algo correr mal, podes sempre restaurá-la.
        </p>
        <input ref={inputFicheiroRef} type="file" accept=".sql" className="hidden" onChange={handleEscolherFicheiro} />
        <button onClick={() => inputFicheiroRef.current?.click()} disabled={importar.isPending} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:bg-bg disabled:opacity-50">
          {importar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-3.5" />}
          {importar.isPending ? 'A importar...' : 'Escolher Ficheiro .sql'}
        </button>
      </Card>

      <div className="mb-4">
        <MigracaoLegadoSection />
      </div>

      <Card className="overflow-x-auto">
        <p className="border-b border-border px-4 py-3 text-[12.5px] font-semibold text-muted">Backups Existentes</p>
        {isLoading && <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-subtle" /></div>}
        <table className="w-full text-left text-[12.5px]">
          <tbody className="divide-y divide-border">
            {!isLoading && data?.length === 0 && <tr><td className="py-10 text-center text-subtle">Ainda não existe nenhum backup.</td></tr>}
            {data?.map((b) => (
              <tr key={b.nome} className="transition-colors hover:bg-bg">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-text">{b.nome}</p>
                  <p className="text-[11px] text-subtle">{new Date(b.criado_em).toLocaleString('pt-PT')} · {formatarTamanho(b.tamanho_bytes)}</p>
                </td>
                <td className="w-24 px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => baixar.mutate(b.nome)} className="text-muted hover:text-text" title="Descarregar"><Download className="size-4" /></button>
                    <button onClick={() => handleRemover(b.nome)} className="text-red-400 hover:text-red-600" title="Remover"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {confirmarImportacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h2 className="mb-2 text-[15px] font-bold text-text">Confirmar Importação</h2>
            <p className="mb-4 text-[13px] text-muted">
              Vais substituir os dados actuais pelo conteúdo de <strong>{confirmarImportacao.name}</strong>
              {' '}({formatarTamanho(confirmarImportacao.size)}). Isto não pode ser desfeito directamente — só restaurando a
              cópia de segurança criada automaticamente antes de começar. Tens a certeza?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmarImportacao(null)} className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text transition-colors hover:bg-bg">Cancelar</button>
              <button onClick={handleConfirmarImportacao} className="rounded-lg bg-badge-red-text px-3.5 py-2 text-[12.5px] font-semibold text-white hover:opacity-90">Sim, Importar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
