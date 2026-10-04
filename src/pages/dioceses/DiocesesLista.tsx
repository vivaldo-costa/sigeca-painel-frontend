import { Church } from 'lucide-react'
import { dioceseHooks } from '@/hooks/useEstrutura'
import { usePermissao } from '@/hooks/usePermissao'
import { ListaHeader } from '@/components/crud/ListaHeader'
import { DataTable, type Coluna, paraColunasExportacao } from '@/components/crud/DataTable'
import { AcoesLinha } from '@/components/crud/AcoesLinha'
import type { Diocese } from '@/types/estrutura'

const { useList, useDelete } = dioceseHooks

export function DiocesesLista() {
  const { data, isLoading } = useList()
  const eliminar = useDelete()
  const { apagar: podeEliminar } = usePermissao('Dioceses')

  const colunas: Coluna<Diocese>[] = [
    { chave: 'nome', titulo: 'Nome', render: (d) => <span className="font-medium">{d.nome}</span> },
    { chave: 'bispo', titulo: 'Bispo Diocesano', render: (d) => d.bispo },
    { chave: 'cidade', titulo: 'Cidade', render: (d) => d.cidade ?? '—' },
    { chave: 'ab_diocese', titulo: 'Abrev.', render: (d) => d.ab_diocese },
    { chave: 'coordenador', titulo: 'Coordenador', render: (d) => d.coordenador },
    { chave: 'telefone_coordenador', titulo: 'Tel. Coordenador', render: (d) => d.telefone_coordenador },
    { chave: 'email_coordenador', titulo: 'E-mail Coordenador', render: (d) => d.email_coordenador },
    { chave: 'assistente', titulo: 'Assistente', render: (d) => d.assistente },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-7">
      <ListaHeader icon={Church} titulo="Dioceses" novoHref="/dioceses/novo" novoLabel="Nova Diocese" exportar={{ colunas: paraColunasExportacao(colunas), linhas: data ?? [] }} />
      <DataTable
        itens={data}
        isLoading={isLoading}
        colunas={colunas}
        filtros={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'bispo', label: 'Bispo Diocesano' },
          { chave: 'cidade', label: 'Cidade' },
          { chave: 'ab_diocese', label: 'Abreviação' },
        ]}
        valorFiltro={(item, chave) => String(item[chave as keyof Diocese] ?? '')}
        acoes={(item) => (
          <AcoesLinha
            editarHref={`/dioceses/${item.id}/editar`}
            podeEliminar={podeEliminar}
            onEliminar={() => eliminar.mutateAsync(item.id)}
          />
        )}
      />
    </div>
  )
}
