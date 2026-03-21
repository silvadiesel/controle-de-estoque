import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from './auth';

export const tipoAcaoEnum = pgEnum('tipo_acao', ['criacao', 'edicao', 'exclusao']);

export const entidadeEnum = pgEnum('entidade', [
  'produto',
  'cliente',
  'fornecedor',
  'categoria',
  'veiculo',
  'ordem_venda',
  'ordem_servico',
  'usuario'
]);

export const movimentacoes = pgTable('movimentacoes', {
  id: serial('id').primaryKey(),
  tipo_acao: tipoAcaoEnum('tipo_acao').notNull(),
  entidade: entidadeEnum('entidade').notNull(),
  entidade_id: text('entidade_id'),
  descricao: text('descricao').notNull(),
  usuario_id: text('usuario_id').references(() => user.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export type Movimentacao = typeof movimentacoes.$inferSelect;
export type NewMovimentacao = typeof movimentacoes.$inferInsert;
