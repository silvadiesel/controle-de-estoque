import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const categorias = pgTable('categorias', {
  id: serial('id').primaryKey(),
  name: text('name').notNull()
});

// Exporte seus tipos para usar no TypeScript
export type Categorias = typeof categorias.$inferSelect;
export type NewCategorias = typeof categorias.$inferInsert;
