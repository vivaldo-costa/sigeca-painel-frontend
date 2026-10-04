import { Landmark } from 'lucide-react'
import { paroquiaHooks } from '@/hooks/useEstrutura'
import { usePermissao } from '@/hooks/usePermissao'
import { ListaHeader } from '@/components/crud/ListaHeader'
import { DataTable, type Coluna, paraColunasExportacao } from '@/components/crud/DataTable'
import { AcoesLinha } from '@/components/crud/AcoesLinha'
import type { Paroquia } from '@/types/estrutura'

export function ParoquiasLista() {
  const { data, isLoading } = paroquiaHooks.useList()
  const eliminar = paroquiaHooks.useDelete()
  const { apagar: podeEliminar } = usePermissao('Paróquias')

  const colunas: Coluna<Paroquia>[] = [
    { chave: 'nome', titulo: 'Nome', render: (p) => <span className="font-medium">{p.nome}</span> },
    { chave: 'paroco', titulo: 'Pároco', render: (p) => p.paroco ?? '—' },
    { chave: 'telefone', titulo: 'Telefone', render: (p) => p.telefone ?? '—' },
    { chave: 'email', titulo: 'E-mail', render: (p) => p.email ?? '—' },
    { chave: 'endereco', titulo: 'Endereço', render: (p) => p.endereco ?? '—' },
    { chave: 'vigararia_nome', titulo: 'Vigararia', render: (p) => p.vigararia_nome ?? '—' },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-7">
      <ListaHeader icon={Landmark} titulo="Paróquias" novoHref="/paroquias/novo" novoLabel="Nova Paróquia" exportar={{ colunas: paraColunasExportacao(colunas), linhas: data ?? [] }} />
      <DataTable
        itens={data}
        isLoading={isLoading}
        colunas={colunas}
        filtros={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'paroco', label: 'Pároco' },
          { chave: 'vigararia_nome', label: 'Vigararia' },
        ]}
        valorFiltro={(item, chave) => String(item[chave as keyof Paroquia] ?? '')}
        acoes={(item) => (
          <AcoesLinha
            editarHref={`/paroquias/${item.id}/editar`}
            podeEliminar={podeEliminar}
            onEliminar={() => eliminar.mutateAsync(item.id)}
          />
        )}
      />
    </div>
  )
}
