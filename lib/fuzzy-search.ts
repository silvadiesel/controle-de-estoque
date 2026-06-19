/**
 * Busca fuzzy compartilhada (token-AND com ranking por relevância).
 *
 * Estratégia híbrida:
 * - `fuzzyKeys`: campos textuais (nome, descrição, etc.) → cada palavra do termo
 *   precisa aparecer no item (semântica E/AND), com tolerância a typo e acento.
 *   O ranking favorece, nesta ordem: palavra exata > prefixo > substring > fuzzy.
 * - `exactKeys`: campos de documento/código (CPF, CNPJ, placa, código…) →
 *   substring exata/compacta, preservando a busca por documento sem ruído fuzzy.
 *
 * Por que token-AND em vez de casar o termo inteiro de uma vez: digitar
 * "sensor rail" deve trazer "Sensor de pressão do rail" no topo e descartar
 * itens que só contêm "sensor". Casar a string inteira (comportamento antigo do
 * Fuse) não exigia todas as palavras e ranqueava por um score opaco, deixando
 * itens irrelevantes acima do desejado.
 *
 * O resultado é a união deduplicada: primeiro os matches fuzzy (ordenados por
 * relevância), depois os matches exatos restantes.
 */

/** Remove acentos/diacríticos (NFD → descarta marcas combinantes). */
function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalize(value: unknown): string {
  return stripDiacritics(
    String(value ?? '')
      .trim()
      .toLowerCase()
  );
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

/** Distância de edição de Levenshtein (tolerância a typo). */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

function scoreToken(
  haystack: string,
  words: string[],
  token: string
): number | null {
  let best: number | null = null;
  const consider = (s: number) => {
    if (best === null || s < best) best = s;
  };

  for (const word of words) {
    if (word === token) return 0; // palavra idêntica: melhor caso possível
    if (word.startsWith(token))
      consider(0.1); // prefixo de uma palavra
    else if (word.includes(token)) consider(0.25); // dentro de uma palavra
  }

  // Substring que atravessa palavras/pontuação (ex.: "depressao" em "de pressao").
  if (best === null && haystack.includes(token)) consider(0.3);

  // Tolerância a typo só para tokens com ≥ 3 chars (abaixo disso é ruído).
  if (best === null && token.length >= 3) {
    let bestRatio = Infinity;
    for (const word of words) {
      // Poda: palavras com tamanho muito distante nunca casarão sob o limite.
      if (Math.abs(word.length - token.length) > 2) continue;
      const ratio =
        levenshtein(token, word) / Math.max(token.length, word.length);
      if (ratio < bestRatio) bestRatio = ratio;
    }
    const maxRatio = token.length <= 4 ? 0.25 : 0.34; // ~1 typo em palavras curtas
    if (bestRatio <= maxRatio) consider(0.4 + bestRatio);
  }

  return best;
}

function scoreItem(
  haystack: string,
  words: string[],
  tokens: string[],
  normalizedTerm: string
): number | null {
  let total = 0;
  for (const token of tokens) {
    const s = scoreToken(haystack, words, token);
    if (s === null) return null;
    total += s;
  }

  // Bônus: o termo inteiro aparece contíguo (ex.: "sensor rail" literal).
  if (tokens.length > 1 && haystack.includes(normalizedTerm)) total -= 0.3;

  // Desempate: nomes mais curtos (mais específicos) primeiro.
  total += Math.min(haystack.length, 400) / 4000;

  return total;
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

  const normalizedTerm = normalize(trimmed);
  const tokens = normalizedTerm.split(/\s+/).filter(Boolean);

  // --- Bloco fuzzy: cada palavra precisa casar (AND), ordenado por relevância.
  const scored: { item: T; score: number }[] = [];
  if (fuzzyKeys.length > 0 && tokens.length > 0) {
    for (const item of items) {
      const haystack = fuzzyKeys
        .map((key) => normalize(getByPath(item, key)))
        .filter(Boolean)
        .join(' ');
      if (!haystack) continue;

      const words = haystack.split(/\s+/);
      const score = scoreItem(haystack, words, tokens, normalizedTerm);
      if (score !== null) scored.push({ item, score });
    }
    scored.sort((a, b) => a.score - b.score);
  }
  const fuzzyMatches = scored.map((s) => s.item);

  // --- Bloco exato: documentos/códigos por substring (sem ruído fuzzy).
  const compactTerm = compact(trimmed);
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
