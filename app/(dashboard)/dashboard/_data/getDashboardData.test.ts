import { buildDashboardPageData } from './dashboard-page-data';
import assert from 'node:assert/strict';
import test from 'node:test';

test('buildDashboardPageData computes counts, states and recent data from settled buckets', () => {
  const result = buildDashboardPageData(
    {
      produtos: {
        ok: true,
        data: [
          { id: 1, quantidade: 2, alerta: 2 },
          { id: 2, quantidade: 0, alerta: 1 }
        ]
      },
      clientes: {
        ok: true,
        data: [{ id: 10 }, { id: 11 }, { id: 12 }]
      },
      servico: {
        ok: true,
        data: [
          {
            id: 21,
            data_criacao: '2026-04-19T12:00:00.000Z',
            status: 'ativa',
            cliente: null,
            veiculo: null
          },
          {
            id: 22,
            data_criacao: '2026-04-18T12:00:00.000Z',
            status: 'cancelada',
            cliente: null,
            veiculo: null
          }
        ]
      },
      venda: {
        ok: false,
        data: []
      },
      movimentacoes: {
        ok: true,
        data: [
          {
            id: 31,
            tipo_acao: 'criacao',
            entidade: 'produto',
            entidade_id: '1',
            descricao: 'Criou peça',
            created_at: '2026-04-20T11:00:00.000Z',
            usuario: { id: 'u1', name: 'Larissa' }
          }
        ]
      }
    },
    new Date('2026-04-20T12:00:00.000Z')
  );

  assert.equal(result.dashboardState, 'partial-error');
  assert.equal(result.totalProdutos, 2);
  assert.equal(result.totalClientes, 3);
  assert.equal(result.ordensAtivas, 1);
  assert.equal(result.alertasEstoque, 2);
  assert.equal(result.produtosState, 'ready');
  assert.equal(result.vendaState, 'unavailable');
  assert.equal(result.movimentacoes.length, 1);
  assert.equal(result.chartData.at(-1)?.label, 'Hoje');
  assert.equal(result.chartData.at(-1)?.count, 1);
});
