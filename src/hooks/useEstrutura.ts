import { createCrudHooks } from './createCrudHooks'
import type { Diocese, Vigararia, Paroquia, Agrupamento, Seccao } from '@/types/estrutura'

export const dioceseHooks = createCrudHooks<Diocese>('dioceses')
export const vigarariaHooks = createCrudHooks<Vigararia>('vigararias')
export const paroquiaHooks = createCrudHooks<Paroquia>('paroquias')
export const agrupamentoHooks = createCrudHooks<Agrupamento>('agrupamentos')
export const seccaoHooks = createCrudHooks<Seccao>('seccoes')
