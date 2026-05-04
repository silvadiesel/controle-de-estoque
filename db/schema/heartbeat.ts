import { pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

// Tabela operacional usada pelo cron de keep-alive do Supabase free tier
// (banco pausa após 7 dias sem atividade de escrita). Não exposta na UI.
export const heartbeat = pgTable('heartbeat', {
  id: serial('id').primaryKey(),
  pingedAt: timestamp('pinged_at', { withTimezone: true })
    .notNull()
    .defaultNow()
});

export type Heartbeat = typeof heartbeat.$inferSelect;
export type NewHeartbeat = typeof heartbeat.$inferInsert;
