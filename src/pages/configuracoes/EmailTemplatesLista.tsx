import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import type { EmailTemplate } from '@/types/emailTemplate'

export function EmailTemplatesLista() {
  const { data, isLoading } = useEmailTemplates()

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="modelos-email"
          titulo="Modelos de E-mail"
          colunas={[
            { titulo: 'Chave', valor: (t: EmailTemplate) => t.chave },
            { titulo: 'Nome', valor: (t) => t.nome_exibicao },
            { titulo: 'Assunto', valor: (t) => t.assunto },
            { titulo: 'Estado', valor: (t) => (t.activo ? 'Activo' : 'Inactivo') },
          ]}
          linhas={data ?? []}
        />
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="space-y-2">
        {data?.map((template) => (
          <Link key={template.id} to={`/configuracoes/email/templates/${template.id}`}>
            <Card className="hover-lift flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-text">{template.nome_exibicao}</p>
                <p className="text-[12px] text-subtle">{template.assunto}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${template.activo ? 'bg-badge-green-bg text-badge-green-text' : 'bg-bg text-subtle'}`}>
                {template.activo ? 'Activo' : 'Inactivo'}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
