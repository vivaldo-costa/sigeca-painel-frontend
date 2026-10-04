import { GraduationCap } from 'lucide-react'
import { AtividadesGenericaPage } from '@/components/atividades/AtividadesGenericaPage'
import { criarHooksAtividade } from '@/hooks/criarHooksAtividade'

const hooks = criarHooksAtividade('/formacoes')

export function FormacoesLista() {
  return <AtividadesGenericaPage titulo="Formações" icone={GraduationCap} moduloChave="Formações" hooks={hooks} />
}
