import { db, schema } from '@/db';
import { eq, sql } from 'drizzle-orm';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface PecaItem {
  peca_id: number;
  quantidade: number;
}

/**
 * Valida se há estoque suficiente e decrementa atomicamente.
 * Usa SELECT FOR UPDATE para evitar race conditions.
 */
export async function validateAndDecrementStock(tx: Tx, pecas: PecaItem[]): Promise<void> {
  for (const item of pecas) {
    const [peca] = await tx
      .select({ id: schema.pecas.id, name_peca: schema.pecas.name_peca, quantidade: schema.pecas.quantidade })
      .from(schema.pecas)
      .where(eq(schema.pecas.id, item.peca_id))
      .for('update');

    if (!peca) {
      throw new Error(`Peça com ID ${item.peca_id} não encontrada`);
    }

    if (peca.quantidade < item.quantidade) {
      throw new Error(`Estoque insuficiente para "${peca.name_peca}". Disponível: ${peca.quantidade}, Solicitado: ${item.quantidade}`);
    }

    await tx
      .update(schema.pecas)
      .set({ quantidade: sql`${schema.pecas.quantidade} - ${item.quantidade}` })
      .where(eq(schema.pecas.id, item.peca_id));
  }
}

/**
 * Restaura estoque (incrementa quantidade) para as peças informadas.
 */
export async function restoreStock(tx: Tx, pecas: PecaItem[]): Promise<void> {
  for (const item of pecas) {
    await tx
      .update(schema.pecas)
      .set({ quantidade: sql`${schema.pecas.quantidade} + ${item.quantidade}` })
      .where(eq(schema.pecas.id, item.peca_id));
  }
}

/**
 * Ajusta estoque ao editar uma ordem: calcula diff entre peças antigas e novas.
 * - Peças removidas: restaura estoque
 * - Peças adicionadas: valida e decrementa
 * - Peças com quantidade alterada: ajusta a diferença
 */
export async function adjustStock(
  tx: Tx,
  oldPecas: PecaItem[],
  newPecas: PecaItem[]
): Promise<void> {
  const oldMap = new Map(oldPecas.map((p) => [p.peca_id, p.quantidade]));
  const newMap = new Map(newPecas.map((p) => [p.peca_id, p.quantidade]));

  // Peças removidas: restaurar estoque
  for (const [pecaId, oldQtd] of oldMap) {
    if (!newMap.has(pecaId)) {
      await restoreStock(tx, [{ peca_id: pecaId, quantidade: oldQtd }]);
    }
  }

  // Peças adicionadas ou com quantidade alterada
  for (const [pecaId, newQtd] of newMap) {
    const oldQtd = oldMap.get(pecaId);

    if (oldQtd === undefined) {
      // Peça nova: validar e decrementar tudo
      await validateAndDecrementStock(tx, [{ peca_id: pecaId, quantidade: newQtd }]);
    } else if (newQtd > oldQtd) {
      // Quantidade aumentou: validar e decrementar a diferença
      await validateAndDecrementStock(tx, [{ peca_id: pecaId, quantidade: newQtd - oldQtd }]);
    } else if (newQtd < oldQtd) {
      // Quantidade diminuiu: restaurar a diferença
      await restoreStock(tx, [{ peca_id: pecaId, quantidade: oldQtd - newQtd }]);
    }
  }
}
