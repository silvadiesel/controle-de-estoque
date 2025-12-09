import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const fornecedor = pgTable("fornecedor", {
  id: serial("id").primaryKey(),
  name_empresa: text("name_empresa").notNull(),
  cnpj: text("cnpj").notNull(),
  status: boolean("status").default(true),
  telefone: text("telefone").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exporte seus tipos para usar no TypeScript
export type Fornecedor = typeof fornecedor.$inferSelect;
export type NewFornecedor = typeof fornecedor.$inferInsert;
