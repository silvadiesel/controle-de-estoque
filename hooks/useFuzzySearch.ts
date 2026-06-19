'use client';

import { useMemo } from 'react';

import { fuzzyFilter, type FuzzySearchConfig } from '@/lib/fuzzy-search';

/**
 * Wrapper memoizado de `fuzzyFilter` para uso em hooks/componentes.
 *
 * IMPORTANTE: passe `config` como constante de módulo (referência estável),
 * senão o `useMemo` recalcula a cada render.
 */
export function useFuzzySearch<T>(
  items: T[],
  term: string,
  config: FuzzySearchConfig
): T[] {
  return useMemo(
    () => fuzzyFilter(items, term, config),
    [items, term, config]
  );
}
