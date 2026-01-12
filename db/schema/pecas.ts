import { categorias } from './categorias';
import { fornecedor } from './fornecedor';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const pecas = pgTable('pecas', {
  id: serial('id').primaryKey(),
  name_peca: text('name_peca').notNull(),
  data_cadastro: timestamp('data_cadastro').defaultNow(),
  codigo: text('codigo').notNull(),
  categoria_id: integer('categoria_id').references(() => categorias.id),
  quantidade: integer('quantidade').notNull(),
  preco: integer('preco').notNull(),
  fornecedor_id: integer('fornecedor_id').references(() => fornecedor.id),
  localizacao: text('localizacao').array(),
  imagem: text('imagem')
});

export type Peca = typeof pecas.$inferSelect;
export type NewPeca = typeof pecas.$inferInsert;
