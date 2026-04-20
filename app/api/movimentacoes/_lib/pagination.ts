const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export interface MovimentacoesPagination {
  isPaginatedRequest: boolean;
  page: number;
  pageSize: number;
  offset: number;
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parseMovimentacoesPagination(
  requestUrl: string
): MovimentacoesPagination {
  const { searchParams } = new URL(requestUrl);
  const hasPage = searchParams.has('page');
  const hasPageSize = searchParams.has('pageSize');

  const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
  const pageSize = Math.min(
    parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  return {
    isPaginatedRequest: hasPage || hasPageSize,
    page,
    pageSize,
    offset: (page - 1) * pageSize
  };
}
