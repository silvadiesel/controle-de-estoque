import { cliente } from './cliente';
import { pecas } from './pecas';
import { integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Enum para status da ordem de venda
export const statusOrdemVendaEnum = pgEnum('status_ordem_venda', ['ativa', 'fechada', 'cancelada']);

// Enum para método de pagamento
export const metodoPagamentoEnum = pgEnum('metodo_pagamento', [
  'pix',
  'boleto',
  'cheque',
  'debito',
  'credito',
  'dinheiro'
]);

// Tabela principal de Ordem de Venda
export const ordemVenda = pgTable('ordem_venda', {
  id: serial('id').primaryKey(),
  data_criacao: timestamp('data_criacao').notNull().defaultNow(),
  data_pagamento: timestamp('data_pagamento'),
  data_previsao_pagamento: timestamp('data_previsao_pagamento'),
  status: statusOrdemVendaEnum('status').notNull().default('ativa'),
  cliente_id: integer('cliente_id')
    .notNull()
    .references(() => cliente.id),
  observacao: text('observacao'),
  valor_total: integer('valor_total').notNull().default(0),
  metodo_pagamento: metodoPagamentoEnum('metodo_pagamento')
});

// Tabela de relacionamento entre Ordem de Venda e Peças (many-to-many)
export const ordemVendaPecas = pgTable('ordem_venda_pecas', {
  id: serial('id').primaryKey(),
  ordem_venda_id: integer('ordem_venda_id')
    .notNull()
    .references(() => ordemVenda.id, { onDelete: 'cascade' }),
  peca_id: integer('peca_id')
    .notNull()
    .references(() => pecas.id),
  quantidade: integer('quantidade').notNull()
});

// Tipos TypeScript
export type OrdemVenda = typeof ordemVenda.$inferSelect;
export type NewOrdemVenda = typeof ordemVenda.$inferInsert;
export type OrdemVendaPecas = typeof ordemVendaPecas.$inferSelect;
export type NewOrdemVendaPecas = typeof ordemVendaPecas.$inferInsert;
