import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';

// A tabela empresa é um SINGLETON por deploy: cada banco só pode conter 1 linha,
// sempre com id = 1. Esse invariante é enforçado pelo CHECK constraint abaixo +
// pelo uso do tipo integer (não serial, para que o id não seja gerado automaticamente).
// Todos os reads/writes DEVEM usar a constante EMPRESA_SINGLETON_ID.
export const EMPRESA_SINGLETON_ID = 1 as const;

export const empresa = pgTable(
  'empresa',
  {
    id: integer('id').primaryKey(),
    nomeFantasia: text('nome_fantasia').notNull(),
    cnpj: text('cnpj').notNull(),
    cidade: text('cidade').notNull(),
    estado: varchar('estado', { length: 2 }).notNull(),
    codigoVerificacao: varchar('codigo_verificacao', { length: 4 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
  },
  (t) => [check('empresa_singleton', sql`${t.id} = 1`)]
);

export type Empresa = typeof empresa.$inferSelect;
export type NewEmpresa = typeof empresa.$inferInsert;
