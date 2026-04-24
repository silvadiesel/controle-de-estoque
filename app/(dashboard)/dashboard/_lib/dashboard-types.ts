export type DashboardBlockState = 'ready' | 'unavailable';

export interface MovimentacaoAPI {
  id: number;
  tipo_acao: 'criacao' | 'edicao' | 'exclusao';
  entidade: string;
  entidade_id: string | null;
  descricao: string;
  created_at: string;
  usuario: { id: string; name: string } | null;
}

export interface OrdemServicoItem {
  id: number;
  data_criacao: string;
  status: 'ativa' | 'fechada' | 'cancelada';
  cliente: { nome_empresa: string } | null;
  veiculo: { placa: string; modelo: string } | null;
}

export interface OrdemVendaItem {
  id: number;
  data_criacao: string;
  status: 'ativa' | 'fechada' | 'cancelada';
  metodo_pagamento:
    | 'pix'
    | 'boleto'
    | 'cheque'
    | 'debito'
    | 'credito'
    | 'dinheiro'
    | null;
  cliente: { nome_empresa: string } | null;
}
