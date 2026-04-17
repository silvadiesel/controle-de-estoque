import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const maoObra = pgTable('mao_obra', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  valor: integer('valor').notNull(),
  descricao: text('descricao')
});

export type MaoObra = typeof maoObra.$inferSelect;
export type NewMaoObra = typeof maoObra.$inferInsert;
