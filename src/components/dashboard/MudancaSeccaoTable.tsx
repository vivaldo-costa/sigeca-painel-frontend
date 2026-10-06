import { ArrowRight } from 'lucide-react'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { MudancaSeccao } from '@/types/dashboard'

export function MudancaSeccaoTable({ dados }: { dados: MudancaSeccao[] }) {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[13.5px] font-semibold text-text">Sugestões de Mudança de Secção</h3>
          <p className="mt-0.5 text-[11.5px] text-subtle">Com base na idade actual face às faixas etárias de cada secção</p>
        </div>
        <ExportarBotoes tamanho="sm" nomeFicheiro="sugestoes-mudanca-seccao" titulo="Sugestões de Mudança de Secção"
          colunas={[
            { titulo: 'Nome', valor: (m: MudancaSeccao) => m.nome },
            { titulo: 'Código', valor: (m: MudancaSeccao) => m.codigo_associado },
            { titulo: 'Idade', valor: (m: MudancaSeccao) => m.idade },
            { titulo: 'Secção actual', valor: (m: MudancaSeccao) => m.secao_atual ?? '—' },
            { titulo: 'Nova secção', valor: (m: MudancaSeccao) => m.nova_secao },
            { titulo: 'Faixa etária', valor: (m: MudancaSeccao) => m.faixas_nova_secao },
          ]}
          linhas={dados} />
      </CardHeader>
      <CardBody className="p-0">
        {dados.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-subtle">Sem sugestões no momento.</p>
        ) : (
          <div className="max-h-[340px] overflow-y-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="sticky top-0 bg-bg text-[10.5px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-2 font-medium">Escuteiro</th>
                  <th className="px-3 py-2 font-medium">Idade</th>
                  <th className="px-3 py-2 font-medium">Secção Actual</th>
                  <th className="px-3 py-2 font-medium">Sugestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dados.map((d, i) => (
                  <tr key={i} className="hover:bg-bg">
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-text">{d.nome}</p>
                      <p className="font-mono text-[10.5px] text-subtle">{d.codigo_associado}</p>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-muted">{d.idade}</td>
                    <td className="px-3 py-2.5 text-muted">{d.secao_atual ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-1.5 font-medium text-badge-blue-text">
                        <ArrowRight className="size-3" /> {d.nova_secao}
                      </span>
                      <span className="text-[10.5px] text-subtle">{d.faixas_nova_secao}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
