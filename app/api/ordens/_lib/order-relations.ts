type OrdemBase = {
  id: number;
};

type PecaServico = {
  ordem_servico_id: number;
};

type MaoObraServico = {
  ordem_servico_id: number;
};

type PecaVenda = {
  ordem_venda_id: number;
};

export function attachOrdensServicoRelations<
  TOrdem extends OrdemBase,
  TPeca extends PecaServico,
  TMaoObra extends MaoObraServico
>(ordens: TOrdem[], pecas: TPeca[], maoObra: TMaoObra[]) {
  const pecasPorOrdem = new Map<
    number,
    Array<Omit<TPeca, 'ordem_servico_id'>>
  >();

  for (const peca of pecas) {
    const { ordem_servico_id, ...pecaSemOrdemId } = peca;
    const items = pecasPorOrdem.get(ordem_servico_id) ?? [];
    items.push(pecaSemOrdemId);
    pecasPorOrdem.set(ordem_servico_id, items);
  }

  const maoObraPorOrdem = new Map<
    number,
    Array<Omit<TMaoObra, 'ordem_servico_id'>>
  >();

  for (const item of maoObra) {
    const { ordem_servico_id, ...maoObraSemOrdemId } = item;
    const items = maoObraPorOrdem.get(ordem_servico_id) ?? [];
    items.push(maoObraSemOrdemId);
    maoObraPorOrdem.set(ordem_servico_id, items);
  }

  return ordens.map((ordem) => ({
    ...ordem,
    pecas: pecasPorOrdem.get(ordem.id) ?? [],
    mao_obra: maoObraPorOrdem.get(ordem.id) ?? []
  }));
}

export function attachOrdensVendaPecas<
  TOrdem extends OrdemBase,
  TPeca extends PecaVenda
>(ordens: TOrdem[], pecas: TPeca[]) {
  const pecasPorOrdem = new Map<number, Array<Omit<TPeca, 'ordem_venda_id'>>>();

  for (const peca of pecas) {
    const { ordem_venda_id, ...pecaSemOrdemId } = peca;
    const items = pecasPorOrdem.get(ordem_venda_id) ?? [];
    items.push(pecaSemOrdemId);
    pecasPorOrdem.set(ordem_venda_id, items);
  }

  return ordens.map((ordem) => ({
    ...ordem,
    pecas: pecasPorOrdem.get(ordem.id) ?? []
  }));
}
