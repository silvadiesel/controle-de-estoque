import { cliente } from './cliente';
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text
} from 'drizzle-orm/pg-core';

export const veiculo = pgTable(
  'veiculo',
  {
    id: serial('id').primaryKey(),
    placa: text('placa').notNull(),
    modelo: text('modelo').notNull(),
    status: boolean('status').default(true),
    cliente_id: integer('cliente_id').references(() => cliente.id)
  },
  (table) => ({
    veiculoClienteIdx: index('veiculo_cliente_id_idx').on(table.cliente_id)
  })
);

export type Veiculo = typeof veiculo.$inferSelect;
export type NewVeiculo = typeof veiculo.$inferInsert;
