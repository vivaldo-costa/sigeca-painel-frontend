import { MapPinned } from 'lucide-react'
import { vigarariaHooks } from '@/hooks/useEstrutura'
import { usePermissao } from '@/hooks/usePermissao'
import { ListaHeader } from '@/components/crud/ListaHeader'
import { DataTable, type Coluna, paraColunasExportacao } from '@/components/crud/DataTable'
import { AcoesLinha } from '@/components/crud/AcoesLinha'
import type { Vigararia } from '@/types/estrutura'

export function VigarariasLista() {
  const { data, isLoading } = vigarariaHooks.useList()
  const eliminar = vigarariaHooks.useDelete()
  const { apagar: podeEliminar } = usePermissao('Vigararias / Zonas')

  const colunas: Coluna<Vigararia>[] = [
    { chave: 'nome', titulo: 'Nome', render: (v) => <span className="font-medium">{v.nome}</span> },
    { chave: 'vigario_foraneo', titulo: 'Vigário Forâneo', render: (v) => v.vigario_foraneo },
    { chave: 'diocese_nome', titulo: 'Diocese', render: (v) => v.diocese_nome ?? '—' },
    { chave: 'coordenador', titulo: 'Coordenador', render: (v) => v.coordenador },
    { chave: 'telefone_coordenador', titulo: 'Tel. Coordenador', render: (v) => v.telefone_coordenador ?? '—' },
    {
      chave: 'ativa', titulo: 'Estado',
      valorExportacao: (v) => (v.ativa ? 'Activa' : 'Inactiva'),
      render: (v) => (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${v.ativa ? 'bg-badge-green-bg text-badge-green-text' : 'bg-badge-red-bg text-badge-red-text'}`}>
          {v.ativa ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-7">
      <ListaHeader icon={MapPinned} titulo="Vigararias / Zonas" novoHref="/vigararias/novo" novoLabel="Nova Vigararia" exportar={{ colunas: paraColunasExportacao(colunas), linhas: data ?? [] }} />
      <DataTable
        itens={data}
        isLoading={isLoading}
        colunas={colunas}
        filtros={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'vigario_foraneo', label: 'Vigário Forâneo' },
          { chave: 'diocese_nome', label: 'Diocese' },
        ]}
        valorFiltro={(item, chave) => String(item[chave as keyof Vigararia] ?? '')}
        acoes={(item) => (
          <AcoesLinha
            editarHref={`/vigararias/${item.id}/editar`}
            podeEliminar={podeEliminar}
            onEliminar={() => eliminar.mutateAsync(item.id)}
          />
        )}
      />
    </div>
  )
}
