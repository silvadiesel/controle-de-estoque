import { db, schema } from '@/db';
import { auth } from '@/lib/auth';

type TipoAcao = 'criacao' | 'edicao' | 'exclusao';
type Entidade =
  | 'produto'
  | 'cliente'
  | 'fornecedor'
  | 'categoria'
  | 'veiculo'
  | 'ordem_venda'
  | 'ordem_servico'
  | 'usuario'
  | 'mao_obra';

export async function logAction(
  request: Request,
  tipoAcao: TipoAcao,
  entidade: Entidade,
  entidadeId: string,
  descricao: string
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    await db.insert(schema.movimentacoes).values({
      tipo_acao: tipoAcao,
      entidade,
      entidade_id: entidadeId,
      descricao,
      usuario_id: session?.user?.id ?? null
    });
  } catch (err) {
    console.error('Erro ao registrar movimentação:', err);
  }
}
