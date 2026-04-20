import { boolean, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const cliente = pgTable('cliente', {
  id: serial('id').primaryKey(),
  name_cliente: text('name').notNull(),
  nome_empresa: text('nome_empresa').notNull(),
  cnpj: text('cnpj').notNull(),
  cpf: text('cpf').notNull(),
  telefone: text('telefone').notNull(),
  status: boolean('status').default(true),
  id_veiculos: integer('id_veiculos').array(),
  rua: text('rua'),
  numero: text('numero'),
  bairro: text('bairro'),
  cidade: text('cidade'),
  estado: text('estado'),
  cep: text('cep')
});

export type Cliente = typeof cliente.$inferSelect;
export type NewCliente = typeof cliente.$inferInsert;
