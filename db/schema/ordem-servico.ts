import { user } from './auth';
import { cliente } from './cliente';
import { maoObra } from './mao-obra';
import { pecas } from './pecas';
import { veiculo } from './veiculo';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

// Enum para status da ordem de serviço
export const statusOrdemEnum = pgEnum('status_ordem', [
  'ativa',
  'fechada',
  'cancelada'
]);

// Tabela principal de Ordem de Serviço
export const ordemServico = pgTable(
  'ordem_servico',
  {
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
    funcionario_responsavel_id: text('funcionario_responsavel_id')
      .notNull()
      .references(() => user.id),
    observacao: text('observacao'),
    valor_total: integer('valor_total').notNull().default(0),
    valor_mao_obra: integer('valor_mao_obra').notNull().default(0)
  },
  (table) => ({
    ordemServicoClienteIdx: index('ordem_servico_cliente_id_idx').on(
      table.cliente_id
    ),
    ordemServicoVeiculoIdx: index('ordem_servico_veiculo_id_idx').on(
      table.veiculo_id
    ),
    ordemServicoFuncionarioIdx: index('ordem_servico_funcionario_id_idx').on(
      table.funcionario_id
    ),
    ordemServicoFuncionarioResponsavelIdx: index(
      'ordem_servico_funcionario_responsavel_id_idx'
    ).on(table.funcionario_responsavel_id)
  })
);

// Tabela de relacionamento entre Ordem de Serviço e Peças (many-to-many)
export const ordemServicoPecas = pgTable(
  'ordem_servico_pecas',
  {
    id: serial('id').primaryKey(),
    ordem_servico_id: integer('ordem_servico_id')
      .notNull()
      .references(() => ordemServico.id, { onDelete: 'cascade' }),
    peca_id: integer('peca_id')
      .notNull()
      .references(() => pecas.id),
    quantidade: integer('quantidade').notNull()
  },
  (table) => ({
    ordemServicoPecasOrdemIdx: index(
      'ordem_servico_pecas_ordem_servico_id_idx'
    ).on(table.ordem_servico_id),
    ordemServicoPecasPecaIdx: index('ordem_servico_pecas_peca_id_idx').on(
      table.peca_id
    )
  })
);

// Tabela de mão de obra vinculada a Ordem de Serviço
export const ordemServicoMaoObra = pgTable('ordem_servico_mao_obra', {
  id: serial('id').primaryKey(),
  ordem_servico_id: integer('ordem_servico_id')
    .notNull()
    .references(() => ordemServico.id, { onDelete: 'cascade' }),
  mao_obra_id: integer('mao_obra_id').references(() => maoObra.id),
  descricao: text('descricao').notNull(),
  valor: integer('valor').notNull()
});

// Tipos TypeScript
export type OrdemServicoMaoObra = typeof ordemServicoMaoObra.$inferSelect;
export type NewOrdemServicoMaoObra = typeof ordemServicoMaoObra.$inferInsert;
export type OrdemServico = typeof ordemServico.$inferSelect;
export type NewOrdemServico = typeof ordemServico.$inferInsert;
export type OrdemServicoPecas = typeof ordemServicoPecas.$inferSelect;
export type NewOrdemServicoPecas = typeof ordemServicoPecas.$inferInsert;
