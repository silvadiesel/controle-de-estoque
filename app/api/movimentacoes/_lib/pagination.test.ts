import { parseMovimentacoesPagination } from './pagination';
import assert from 'node:assert/strict';
import test from 'node:test';

test('parseMovimentacoesPagination keeps legacy array mode when query params are absent', () => {
  assert.deepEqual(
    parseMovimentacoesPagination('http://localhost:3000/api/movimentacoes'),
    {
      isPaginatedRequest: false,
      page: 1,
      pageSize: 50,
      offset: 0
    }
  );
});

test('parseMovimentacoesPagination applies defaults and clamps invalid values', () => {
  assert.deepEqual(
    parseMovimentacoesPagination(
      'http://localhost:3000/api/movimentacoes?page=-3&pageSize=500'
    ),
    {
      isPaginatedRequest: true,
      page: 1,
      pageSize: 200,
      offset: 0
    }
  );
});

test('parseMovimentacoesPagination calculates offset for explicit page and pageSize', () => {
  assert.deepEqual(
    parseMovimentacoesPagination(
      'http://localhost:3000/api/movimentacoes?page=3&pageSize=25'
    ),
    {
      isPaginatedRequest: true,
      page: 3,
      pageSize: 25,
      offset: 50
    }
  );
});
