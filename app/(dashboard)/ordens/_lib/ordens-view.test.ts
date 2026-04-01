import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAvailableMonths,
  buildOrdensMetrics,
  buildVendaFormInitialData,
  filterOrdens
} from './ordens-view';

const serviceOrders = [
  {
    id: 101,
    data_criacao: '2026-03-14T10:00:00.000Z',
    status: 'ativa' as const,
    valor_total: 125000,
    observacao: 'Troca de amortecedor',
    cliente: { id: 1, name_cliente: 'Marina Auto', nome_empresa: 'Marina LTDA' },
    veiculo: { id: 20, placa: 'ABC1D23', modelo: 'Gol 1.6' },
    funcionario: { id: 'u1', name: 'Otavio' },
    funcionario_responsavel: { id: 'u2', name: 'Carlos' },
    pecas: []
  },
  {
    id: 102,
    data_criacao: '2026-02-02T10:00:00.000Z',
    status: 'fechada' as const,
    valor_total: 50000,
    observacao: null,
    cliente: { id: 2, name_cliente: 'Posto Aurora', nome_empresa: '' },
    veiculo: { id: 21, placa: 'XYZ9K88', modelo: 'Strada' },
    funcionario: { id: 'u1', name: 'Otavio' },
    funcionario_responsavel: { id: 'u3', name: 'Fernanda' },
    pecas: []
  },
  {
    id: 103,
    data_criacao: '2026-03-22T10:00:00.000Z',
    status: 'cancelada' as const,
    valor_total: 30000,
    observacao: null,
    cliente: { id: 3, name_cliente: 'Loja Central', nome_empresa: 'Central' },
    veiculo: { id: 22, placa: 'BRA2E45', modelo: 'Onix' },
    funcionario: { id: 'u2', name: 'Carlos' },
    funcionario_responsavel: { id: 'u2', name: 'Carlos' },
    pecas: []
  }
];

const saleOrders = [
  {
    id: 201,
    data_criacao: '2026-03-10T10:00:00.000Z',
    status: 'ativa' as const,
    valor_total: 70000,
    observacao: 'Cliente retirou no balcão',
    metodo_pagamento: 'pix' as const,
    cliente: { id: 4, name_cliente: 'Mercado Vale', nome_empresa: 'Vale SA' },
    pecas: []
  },
  {
    id: 202,
    data_criacao: '2026-01-05T10:00:00.000Z',
    status: 'fechada' as const,
    valor_total: 90000,
    observacao: null,
    metodo_pagamento: 'credito' as const,
    cliente: { id: 5, name_cliente: 'Pneus Norte', nome_empresa: '' },
    pecas: []
  }
];

test('buildOrdensMetrics aggregates counts and value totals', () => {
  const result = buildOrdensMetrics([...serviceOrders, ...saleOrders]);

  assert.deepEqual(result, {
    total: 5,
    ativas: 2,
    fechadas: 2,
    canceladas: 1,
    valorTotal: 365000
  });
});

test('buildAvailableMonths returns distinct descending month keys', () => {
  const result = buildAvailableMonths([...serviceOrders, ...saleOrders]);

  assert.deepEqual(result, ['2026-03', '2026-02', '2026-01']);
});

test('filterOrdens applies status, month and service-specific search fields', () => {
  const result = filterOrdens(serviceOrders, {
    search: 'abc1d23',
    status: 'ativa',
    month: '2026-03'
  });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, 101);
});

test('filterOrdens applies sale search using payment method and client', () => {
  const result = filterOrdens(saleOrders, {
    search: 'pix',
    status: 'all',
    month: 'all'
  });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, 201);
});

test('buildVendaFormInitialData normalizes payment dates into a single field', () => {
  const fromPayment = buildVendaFormInitialData({
    data_pagamento: '2026-03-18T15:00:00.000Z',
    data_previsao_pagamento: '2026-03-22T15:00:00.000Z',
    status: 'ativa',
    cliente_id: 10,
    observacao: 'Entrega combinada',
    valor_total: 120000,
    metodo_pagamento: 'boleto',
    pecas: []
  });

  assert.equal(fromPayment.data_pagamento, '2026-03-18');

  const fromForecast = buildVendaFormInitialData({
    data_pagamento: null,
    data_previsao_pagamento: '2026-04-01T15:00:00.000Z',
    status: 'ativa',
    cliente_id: 11,
    observacao: '',
    valor_total: 0,
    metodo_pagamento: undefined,
    pecas: []
  });

  assert.equal(fromForecast.data_pagamento, '2026-04-01');
});
