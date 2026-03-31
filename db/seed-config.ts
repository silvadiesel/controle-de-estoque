export const PROTECTED_TABLE_NAMES = ['user', 'account', 'session'] as const;

export const RESET_TABLE_NAMES = [
  'movimentacoes',
  'ordem_servico_pecas',
  'ordem_servico',
  'ordem_venda_pecas',
  'ordem_venda',
  'veiculo',
  'pecas',
  'cliente',
  'fornecedor',
  'categorias'
] as const;

export const SEED_COUNTS = {
  categorias: 10,
  fornecedor: 10,
  cliente: 10,
  pecas: 20,
  ordemVenda: 20,
  ordemServico: 20
} as const;

export type RandomGenerator = () => number;

export function createSeededRandom(seed: number): RandomGenerator {
  let state = seed % 2147483647;

  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function randomInt(
  min: number,
  max: number,
  random: RandomGenerator
): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function pickOne<T>(items: readonly T[], random: RandomGenerator): T {
  return items[randomInt(0, items.length - 1, random)]!;
}

export function pickManyUnique<T>(
  items: readonly T[],
  count: number,
  random: RandomGenerator
): T[] {
  const pool = [...items];
  const limit = Math.min(count, pool.length);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index, random);
    const current = pool[index];

    pool[index] = pool[swapIndex]!;
    pool[swapIndex] = current!;
  }

  return pool.slice(0, limit);
}

export function buildVehicleTargets(
  clientCount: number,
  random: RandomGenerator
): number[] {
  return Array.from({ length: clientCount }, () => randomInt(2, 3, random));
}

export function pickExistingUserId(
  userIds: string[],
  random: RandomGenerator
): string {
  if (userIds.length === 0) {
    throw new Error(
      'Nao foi encontrado nenhum user para relacionar as ordens.'
    );
  }

  return pickOne(userIds, random);
}
