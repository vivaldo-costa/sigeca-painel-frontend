import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { uploadUrl } from '@/lib/uploads'
import { formatarAgrupamento } from '@/lib/formatadores'
import { PaginacaoLista, usePaginacao } from '@/components/ui/PaginacaoLista'
import type { UltimoUtilizador } from '@/types/dashboard'

const POR_PAGINA = 8

export function UltimosRegistosCard({ utilizadores }: { utilizadores: UltimoUtilizador[] }) {
  const pag = usePaginacao(utilizadores, POR_PAGINA)
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <h3 className="text-[13.5px] font-semibold text-text">Últimos Registos</h3>
        <ExportarBotoes tamanho="sm" nomeFicheiro="ultimos-registos" titulo="Últimos Registos de Escuteiros"
          colunas={[
            { titulo: 'Nome', valor: (u: UltimoUtilizador) => u.nome },
            { titulo: 'Código', valor: (u: UltimoUtilizador) => u.codigo_associado },
            { titulo: 'Diocese', valor: (u: UltimoUtilizador) => u.diocese ?? '—' },
            { titulo: 'Vigararia', valor: (u: UltimoUtilizador) => u.vigararia ?? '—' },
            { titulo: 'Agrupamento', valor: (u: UltimoUtilizador) => (u.agrupamento ? formatarAgrupamento({ nome: u.agrupamento, ab_agrupamento: u.ab_agrupamento }) : '—') },
            { titulo: 'Secção', valor: (u: UltimoUtilizador) => u.seccao_nome ?? '—' },
          ]}
          linhas={utilizadores} />
      </CardHeader>
      <CardBody className="space-y-1">
        {utilizadores.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-subtle">Sem registos recentes.</p>
        ) : (
          <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
          {pag.visiveis.map((u, i) => (
            <div key={pag.inicio + i} className="flex animate-fade-in items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-bg" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-bg text-[11px] font-semibold text-muted">
                {u.foto ? (
                  <img src={uploadUrl('avatar', u.foto)!} className="size-full object-cover" alt={u.nome} />
                ) : (
                  u.nome[0]?.toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-text">{u.nome}</p>
                <p className="truncate text-[11px] text-subtle">
                  {[u.agrupamento ? formatarAgrupamento({ nome: u.agrupamento, ab_agrupamento: u.ab_agrupamento }) : null, u.seccao_nome].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10.5px] text-subtle">{u.codigo_associado}</span>
            </div>
          ))}
          </div>
          <PaginacaoLista {...pag} porPagina={POR_PAGINA} onMudar={pag.setPagina} className="mt-2" />
          </>
        )}
      </CardBody>
    </Card>
  )
}
