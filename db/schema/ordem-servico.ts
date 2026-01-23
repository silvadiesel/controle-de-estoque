import { cliente } from './cliente';
import { veiculo } from './veiculo';
import { pecas } from './pecas';
import { user } from './auth';
import { integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Enum para status da ordem de serviço
export const statusOrdemEnum = pgEnum('status_ordem', ['ativa', 'fechada', 'cancelada']);

// Tabela principal de Ordem de Serviço
export const ordemServico = pgTable('ordem_servico', {
  id: serial('id').primaryKey(),
  data_criacao: timestamp('data_criacao').notNull().defaultNow(),
  data_chegada: timestamp('data_chegada').notNull(),
  data_saida: timestamp('data_saida'),
  status: statusOrdemEnum('status').notNull().default('ativa'),
  cliente_id: integer('cliente_id')
    .notNull()
    .references(() => cliente.id),
  veiculo_id: integer('veiculo_id')
    .notNull()
    .references(() => veiculo.id),
  funcionario_id: text('funcionario_id')
    .notNull()
    .references(() => user.id),
  observacao: text('observacao'),
  valor_total: integer('valor_total').notNull().default(0)
});

// Tabela de relacionamento entre Ordem de Serviço e Peças (many-to-many)
export const ordemServicoPecas = pgTable('ordem_servico_pecas', {
  id: serial('id').primaryKey(),
  ordem_servico_id: integer('ordem_servico_id')
    .notNull()
    .references(() => ordemServico.id, { onDelete: 'cascade' }),
  peca_id: integer('peca_id')
    .notNull()
    .references(() => pecas.id),
  quantidade: integer('quantidade').notNull()
});

// Tipos TypeScript
export type OrdemServico = typeof ordemServico.$inferSelect;
export type NewOrdemServico = typeof ordemServico.$inferInsert;
export type OrdemServicoPecas = typeof ordemServicoPecas.$inferSelect;
export type NewOrdemServicoPecas = typeof ordemServicoPecas.$inferInsert;
