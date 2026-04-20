import {
  attachOrdensServicoRelations,
  attachOrdensVendaPecas
} from './order-relations';
import assert from 'node:assert/strict';
import test from 'node:test';

test('attachOrdensServicoRelations preserves order shape and groups related records by ordem id', () => {
  const ordens = [
    { id: 3, descricao: 'Ordem 3' },
    { id: 5, descricao: 'Ordem 5' }
  ];

  const pecas = [
    { ordem_servico_id: 5, id: 10, quantidade: 2 },
    { ordem_servico_id: 3, id: 11, quantidade: 1 },
    { ordem_servico_id: 5, id: 12, quantidade: 4 }
  ];

  const maoObra = [
    { ordem_servico_id: 3, id: 21, descricao: 'Troca', valor: 150 }
  ];

  assert.deepEqual(attachOrdensServicoRelations(ordens, pecas, maoObra), [
    {
      id: 3,
      descricao: 'Ordem 3',
      pecas: [{ id: 11, quantidade: 1 }],
      mao_obra: [{ id: 21, descricao: 'Troca', valor: 150 }]
    },
    {
      id: 5,
      descricao: 'Ordem 5',
      pecas: [
        { id: 10, quantidade: 2 },
        { id: 12, quantidade: 4 }
      ],
      mao_obra: []
    }
  ]);
});

test('attachOrdensVendaPecas returns empty arrays for ordens without related parts', () => {
  const ordens = [
    { id: 1, status: 'ativa' },
    { id: 2, status: 'fechada' }
  ];

  const pecas = [{ ordem_venda_id: 2, id: 99, quantidade: 7 }];

  assert.deepEqual(attachOrdensVendaPecas(ordens, pecas), [
    { id: 1, status: 'ativa', pecas: [] },
    {
      id: 2,
      status: 'fechada',
      pecas: [{ id: 99, quantidade: 7 }]
    }
  ]);
});
