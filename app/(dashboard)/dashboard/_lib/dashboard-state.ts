export type RequestBucket<T> = { ok: boolean; data: T[] };

export type DashboardBuckets = {
  produtos: RequestBucket<{ quantidade: number; alerta: number }>;
  clientes: RequestBucket<unknown>;
  servico: RequestBucket<{ status: string }>;
  venda: RequestBucket<{ status: string }>;
  movimentacoes: RequestBucket<unknown>;
};

export function deriveDashboardState(buckets: DashboardBuckets) {
  const allFailed = Object.values(buckets).every((bucket) => !bucket.ok);
  const hasAnyFailure = Object.values(buckets).some((bucket) => !bucket.ok);

  return {
    pageState: allFailed ? 'total-error' : hasAnyFailure ? 'partial-error' : 'ready',
    cards: {
      produtos: {
        state: buckets.produtos.ok ? 'ready' : 'unavailable',
        value: buckets.produtos.data.length
      },
      clientes: {
        state: buckets.clientes.ok ? 'ready' : 'unavailable',
        value: buckets.clientes.data.length
      }
    }
  } as const;
}
