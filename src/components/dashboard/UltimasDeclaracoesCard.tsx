import { Link } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'
import { useDocumentos } from '@/hooks/useDocumentos'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

/**
 * O design de referência mostra uma biblioteca de documentos estáticos
 * (Plano de Actividades, Regulamento Geral, Manual do Dirigente...) — isso
 * não existe como funcionalidade no sistema; o módulo "Documentos" real
 * emite declarações por actividade. Mostro os dados reais mais recentes
 * desse módulo, com o nome que corresponde ao que realmente é.
 */
export function UltimasDeclaracoesCard() {
  const { data } = useDocumentos({})
  const recentes = [...(data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-[13.5px] font-semibold text-text">Últimas Declarações</h3>
        <Link to="/documentos" className="flex items-center gap-1 text-[11.5px] font-medium text-muted hover:text-text">
          Ver todas <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardBody className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {recentes.length === 0 && <p className="col-span-full py-6 text-center text-[13px] text-subtle">Nenhuma declaração ainda.</p>}
        {recentes.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5">
            <FileText className="size-4 shrink-0 text-subtle" />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-text">{d.nome_utilizador ?? d.codigo_associado}</p>
              <p className="truncate text-[10.5px] text-subtle">{d.estado} · {new Date(d.created_at).toLocaleDateString('pt-PT')}</p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
