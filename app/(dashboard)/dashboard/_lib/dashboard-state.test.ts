import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveDashboardState } from './dashboard-state';

test('marks a card as unavailable when its request fails', () => {
  const result = deriveDashboardState({
    produtos: { ok: false, data: [] },
    clientes: { ok: true, data: [{ id: 1 }] },
    servico: { ok: true, data: [] },
    venda: { ok: true, data: [] },
    movimentacoes: { ok: true, data: [] }
  });

  assert.equal(result.cards.produtos.state, 'unavailable');
  assert.equal(result.pageState, 'partial-error');
});

test('marks the page as total-error when every request fails', () => {
  const result = deriveDashboardState({
    produtos: { ok: false, data: [] },
    clientes: { ok: false, data: [] },
    servico: { ok: false, data: [] },
    venda: { ok: false, data: [] },
    movimentacoes: { ok: false, data: [] }
  });

  assert.equal(result.pageState, 'total-error');
});
