import { buildLast7Days } from '../_lib/chart-data';
import {
  type RequestBucket,
  deriveDashboardState
} from '../_lib/dashboard-state';
import type {
  MovimentacaoAPI,
  OrdemServicoItem,
  OrdemVendaItem
} from '../_lib/dashboard-types';

type ProdutoResumo = {
  id: number;
  quantidade: number;
  alerta: number;
};

type ClienteResumo = {
  id: number;
};

export type DashboardBuckets = {
  produtos: RequestBucket<ProdutoResumo>;
  clientes: RequestBucket<ClienteResumo>;
  servico: RequestBucket<OrdemServicoItem>;
  venda: RequestBucket<OrdemVendaItem>;
  movimentacoes: RequestBucket<MovimentacaoAPI>;
};

export function buildDashboardPageData(
  buckets: DashboardBuckets,
  today = new Date()
) {
  const nextState = deriveDashboardState(buckets);

  return {
    dashboardState: nextState.pageState,
    totalProdutos: nextState.cards.produtos.value,
    totalClientes: nextState.cards.clientes.value,
    ordensAtivas:
      (buckets.servico.ok
        ? buckets.servico.data.filter((ordem) => ordem.status === 'ativa')
            .length
        : 0) +
      (buckets.venda.ok
        ? buckets.venda.data.filter((ordem) => ordem.status === 'ativa').length
        : 0),
    alertasEstoque: buckets.produtos.data.filter(
      (peca) => peca.quantidade <= peca.alerta
    ).length,
    produtosState: nextState.cards.produtos.state,
    clientesState: nextState.cards.clientes.state,
    movimentacoesState: buckets.movimentacoes.ok ? 'ready' : 'unavailable',
    servicoState: buckets.servico.ok ? 'ready' : 'unavailable',
    vendaState: buckets.venda.ok ? 'ready' : 'unavailable',
    ordensServico: buckets.servico.data.slice(0, 5),
    ordensVenda: buckets.venda.data.slice(0, 5),
    movimentacoes: buckets.movimentacoes.data,
    chartData: buildLast7Days(buckets.movimentacoes.data, today)
  } as const;
}
