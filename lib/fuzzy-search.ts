import Fuse, { type IFuseOptions } from 'fuse.js';

/**
 * Busca fuzzy compartilhada (fuse.js).
 *
 * Estratégia híbrida:
 * - `fuzzyKeys`: campos textuais (nome, descrição, etc.) → matching tolerante a
 *   typo e acento via Fuse.
 * - `exactKeys`: campos de documento/código (CPF, CNPJ, placa, código…) →
 *   substring exata/compacta, preservando a busca por documento sem ruído fuzzy.
 *
 * O resultado é a união deduplicada: primeiro os matches fuzzy (ordenados por
 * score), depois os matches exatos restantes.
 */

const DEFAULT_OPTIONS: IFuseOptions<unknown> = {
  threshold: 0.4,
  ignoreLocation: true,
  ignoreDiacritics: true,
  minMatchCharLength: 2
};

export function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

export function compact(value: unknown): string {
  return normalize(value).replace(/[^a-z0-9]/g, '');
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export interface FuzzySearchConfig {
  /** Campos textuais com matching fuzzy (aceita dot-paths: 'cliente.nome'). */
  fuzzyKeys: string[];
  /** Campos de documento/código com substring exata/compacta. */
  exactKeys?: string[];
}

export function fuzzyFilter<T>(
  items: T[],
  term: string,
  config: FuzzySearchConfig
): T[] {
  const trimmed = term.trim();
  if (!trimmed) return items;

  const fuzzyKeys = config.fuzzyKeys ?? [];
  const exactKeys = config.exactKeys ?? [];

  // Termos muito curtos: o algoritmo fuzzy é pouco confiável (e Fuse ignora
  // matches abaixo de `minMatchCharLength`). Cai para substring em todos os
  // campos, preservando o comportamento de "1 letra já filtra".
  if (trimmed.length < 2) {
    const allKeys = [...fuzzyKeys, ...exactKeys];
    const n = normalize(trimmed);
    return items.filter((item) =>
      allKeys.some((key) => normalize(getByPath(item, key)).includes(n))
    );
  }

  const fuzzyMatches =
    fuzzyKeys.length > 0
      ? new Fuse(items, {
          ...(DEFAULT_OPTIONS as IFuseOptions<T>),
          keys: fuzzyKeys
        })
          .search(trimmed)
          .map((result) => result.item)
      : [];

  const compactTerm = compact(trimmed);
  const normalizedTerm = normalize(trimmed);
  const exactMatches =
    exactKeys.length > 0
      ? items.filter((item) =>
          exactKeys.some((key) => {
            const value = getByPath(item, key);
            if (value == null) return false;
            return (
              (compactTerm.length > 0 &&
                compact(value).includes(compactTerm)) ||
              normalize(value).includes(normalizedTerm)
            );
          })
        )
      : [];

  if (exactMatches.length === 0) return fuzzyMatches;

  // União deduplicada por referência (mesmos objetos do array de origem).
  const seen = new Set<T>(fuzzyMatches);
  const result = [...fuzzyMatches];
  for (const item of exactMatches) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}
