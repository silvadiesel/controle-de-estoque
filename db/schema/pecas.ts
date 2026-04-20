import { categorias } from './categorias';
import { fornecedor } from './fornecedor';
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

export const pecas = pgTable(
  'pecas',
  {
    id: serial('id').primaryKey(),
    name_peca: text('name_peca').notNull(),
    data_cadastro: timestamp('data_cadastro').defaultNow(),
    codigo: text('codigo').notNull(),
    categoria_id: integer('categoria_id').references(() => categorias.id),
    quantidade: integer('quantidade').notNull(),
    preco: integer('preco').notNull(),
    fornecedor_id: integer('fornecedor_id').references(() => fornecedor.id),
    localizacao: text('localizacao').array(),
    imagem: text('imagem'),
    alerta: integer('alerta').notNull().default(1)
  },
  (table) => ({
    pecasCategoriaIdx: index('pecas_categoria_id_idx').on(table.categoria_id),
    pecasFornecedorIdx: index('pecas_fornecedor_id_idx').on(table.fornecedor_id)
  })
);

export type Peca = typeof pecas.$inferSelect;
export type NewPeca = typeof pecas.$inferInsert;
