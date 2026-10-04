import { toast } from 'sonner'

/**
 * Wrapper fino sobre o sonner — nomes em português, consistentes com o
 * resto do código. Usar em vez de <Alert> para mensagens transitórias
 * de resultado de uma acção (sucesso/erro ao guardar, eliminar, etc.).
 * <Alert> continua a ser o certo para avisos persistentes/contextuais
 * (estados vazios, dicas de validação, erros de carregamento de página).
 */
export const notificar = {
  sucesso: (mensagem: string) => toast.success(mensagem),
  erro: (mensagem: string) => toast.error(mensagem),
  aviso: (mensagem: string) => toast.warning(mensagem),
  info: (mensagem: string) => toast.message(mensagem),
}
