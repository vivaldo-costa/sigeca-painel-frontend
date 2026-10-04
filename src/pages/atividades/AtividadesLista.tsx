import { CalendarDays } from 'lucide-react'
import { AtividadesGenericaPage } from '@/components/atividades/AtividadesGenericaPage'
import { criarHooksAtividade } from '@/hooks/criarHooksAtividade'

const hooks = criarHooksAtividade('/atividades')

export function AtividadesLista() {
  return <AtividadesGenericaPage titulo="Actividades" icone={CalendarDays} moduloChave="Actividades" hooks={hooks} />
}
