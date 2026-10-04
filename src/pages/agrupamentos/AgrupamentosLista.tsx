import { UsersRound } from 'lucide-react'
import { agrupamentoHooks } from '@/hooks/useEstrutura'
import { usePermissao } from '@/hooks/usePermissao'
import { ListaHeader } from '@/components/crud/ListaHeader'
import { DataTable, type Coluna, paraColunasExportacao } from '@/components/crud/DataTable'
import { AcoesLinha } from '@/components/crud/AcoesLinha'
import type { Agrupamento } from '@/types/estrutura'

export function AgrupamentosLista() {
  const { data, isLoading } = agrupamentoHooks.useList()
  const eliminar = agrupamentoHooks.useDelete()
  const { apagar: podeEliminar } = usePermissao('Agrupamentos')

  const colunas: Coluna<Agrupamento>[] = [
    { chave: 'nome', titulo: 'Nome', render: (a) => <span className="font-medium">{a.nome}</span> },
    { chave: 'ab_agrupamento', titulo: 'N°', render: (a) => <span className="font-mono">{a.ab_agrupamento}</span> },
    { chave: 'paroquia_nome', titulo: 'Paróquia', render: (a) => a.paroquia_nome ?? '—' },
    { chave: 'diocese_nome', titulo: 'Diocese', render: (a) => a.diocese_nome ?? '—' },
    { chave: 'chefe_agrupamento', titulo: 'Chefe', render: (a) => a.chefe_agrupamento ?? '—' },
    { chave: 'chefe_telefone', titulo: 'Tel. Chefe', render: (a) => a.chefe_telefone ?? '—' },
    { chave: 'assistente_espiritual', titulo: 'Assistente', render: (a) => a.assistente_espiritual ?? '—' },
    { chave: 'secretario', titulo: 'Secretário', render: (a) => a.secretario ?? '—' },
    { chave: 'data_fundacao', titulo: 'Fundação', render: (a) => a.data_fundacao ? new Date(a.data_fundacao).toLocaleDateString('pt-PT') : '—' },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-7">
      <ListaHeader icon={UsersRound} titulo="Agrupamentos" novoHref="/agrupamentos/novo" novoLabel="Novo Agrupamento" exportar={{ colunas: paraColunasExportacao(colunas), linhas: data ?? [] }} />
      <DataTable
        itens={data}
        isLoading={isLoading}
        colunas={colunas}
        filtros={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'ab_agrupamento', label: 'N°' },
          { chave: 'paroquia_nome', label: 'Paróquia' },
          { chave: 'diocese_nome', label: 'Diocese' },
        ]}
        valorFiltro={(item, chave) => String(item[chave as keyof Agrupamento] ?? '')}
        acoes={(item) => (
          <AcoesLinha
            editarHref={`/agrupamentos/${item.id}/editar`}
            podeEliminar={podeEliminar}
            onEliminar={() => eliminar.mutateAsync(item.id)}
          />
        )}
      />
    </div>
  )
}
