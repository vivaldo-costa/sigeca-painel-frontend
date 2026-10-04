import { Layers } from 'lucide-react'
import { seccaoHooks } from '@/hooks/useEstrutura'
import { usePermissao } from '@/hooks/usePermissao'
import { ListaHeader } from '@/components/crud/ListaHeader'
import { DataTable, type Coluna, paraColunasExportacao } from '@/components/crud/DataTable'
import { AcoesLinha } from '@/components/crud/AcoesLinha'
import type { Seccao } from '@/types/estrutura'

export function SeccoesLista() {
  const { data, isLoading } = seccaoHooks.useList()
  const eliminar = seccaoHooks.useDelete()
  const { apagar: podeEliminar } = usePermissao('Secções')

  const colunas: Coluna<Seccao>[] = [
    { chave: 'nome', titulo: 'Nome', render: (s) => <span className="font-medium">{s.nome}</span> },
    { chave: 'faixa_minima', titulo: 'Idade mínima', render: (s) => s.faixa_minima },
    { chave: 'faixa_maxima', titulo: 'Idade máxima', render: (s) => s.faixa_maxima },
  ]

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-7">
      <ListaHeader icon={Layers} titulo="Secções" novoHref="/seccoes/novo" novoLabel="Nova Secção" exportar={{ colunas: paraColunasExportacao(colunas), linhas: data ?? [] }} />
      <DataTable
        itens={data}
        isLoading={isLoading}
        colunas={colunas}
        filtros={[{ chave: 'nome', label: 'Nome' }]}
        valorFiltro={(item, chave) => String(item[chave as keyof Seccao] ?? '')}
        acoes={(item) => (
          <AcoesLinha
            editarHref={`/seccoes/${item.id}/editar`}
            podeEliminar={podeEliminar}
            onEliminar={() => eliminar.mutateAsync(item.id)}
          />
        )}
      />
    </div>
  )
}
