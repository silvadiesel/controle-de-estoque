import { db, schema } from '@/db';

import type { RequestBucket } from '../_lib/dashboard-state';
import { buildDashboardPageData } from './dashboard-page-data';
import { desc, eq } from 'drizzle-orm';
import 'server-only';

function toBucket<T>(result: PromiseSettledResult<T[]>): RequestBucket<T> {
  return {
    ok: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : []
  };
}

export async function getDashboardData() {
  const results = await Promise.allSettled([
    db
      .select({
        id: schema.pecas.id,
        quantidade: schema.pecas.quantidade,
        alerta: schema.pecas.alerta
      })
      .from(schema.pecas),
    db.select({ id: schema.cliente.id }).from(schema.cliente),
    db
      .select({
        id: schema.ordemServico.id,
        data_criacao: schema.ordemServico.data_criacao,
        status: schema.ordemServico.status,
        cliente: {
          nome_empresa: schema.cliente.nome_empresa
        },
        veiculo: {
          placa: schema.veiculo.placa,
          modelo: schema.veiculo.modelo
        }
      })
      .from(schema.ordemServico)
      .leftJoin(
        schema.cliente,
        eq(schema.ordemServico.cliente_id, schema.cliente.id)
      )
      .leftJoin(
        schema.veiculo,
        eq(schema.ordemServico.veiculo_id, schema.veiculo.id)
      )
      .orderBy(desc(schema.ordemServico.data_criacao))
      .then((rows) =>
        rows.map((row) => ({
          id: row.id,
          data_criacao: row.data_criacao.toISOString(),
          status: row.status,
          cliente:
            row.cliente && row.cliente.nome_empresa
              ? {
                  nome_empresa: row.cliente.nome_empresa
                }
              : null,
          veiculo:
            row.veiculo && row.veiculo.placa
              ? {
                  placa: row.veiculo.placa,
                  modelo: row.veiculo.modelo
                }
              : null
        }))
      ),
    db
      .select({
        id: schema.ordemVenda.id,
        data_criacao: schema.ordemVenda.data_criacao,
        status: schema.ordemVenda.status,
        metodo_pagamento: schema.ordemVenda.metodo_pagamento,
        cliente: {
          nome_empresa: schema.cliente.nome_empresa
        }
      })
      .from(schema.ordemVenda)
      .leftJoin(
        schema.cliente,
        eq(schema.ordemVenda.cliente_id, schema.cliente.id)
      )
      .orderBy(desc(schema.ordemVenda.data_criacao))
      .then((rows) =>
        rows.map((row) => ({
          id: row.id,
          data_criacao: row.data_criacao.toISOString(),
          status: row.status,
          metodo_pagamento: row.metodo_pagamento,
          cliente:
            row.cliente && row.cliente.nome_empresa
              ? {
                  nome_empresa: row.cliente.nome_empresa
                }
              : null
        }))
      ),
    db
      .select({
        id: schema.movimentacoes.id,
        tipo_acao: schema.movimentacoes.tipo_acao,
        entidade: schema.movimentacoes.entidade,
        entidade_id: schema.movimentacoes.entidade_id,
        descricao: schema.movimentacoes.descricao,
        created_at: schema.movimentacoes.created_at,
        usuario: {
          id: schema.user.id,
          name: schema.user.name
        }
      })
      .from(schema.movimentacoes)
      .leftJoin(
        schema.user,
        eq(schema.movimentacoes.usuario_id, schema.user.id)
      )
      .orderBy(desc(schema.movimentacoes.created_at))
      .then((rows) =>
        rows.map((row) => ({
          id: row.id,
          tipo_acao: row.tipo_acao,
          entidade: row.entidade,
          entidade_id: row.entidade_id,
          descricao: row.descricao,
          created_at: row.created_at.toISOString(),
          usuario:
            row.usuario && row.usuario.id && row.usuario.name
              ? {
                  id: row.usuario.id,
                  name: row.usuario.name
                }
              : null
        }))
      )
  ]);

  return buildDashboardPageData({
    produtos: toBucket(results[0]),
    clientes: toBucket(results[1]),
    servico: toBucket(results[2]),
    venda: toBucket(results[3]),
    movimentacoes: toBucket(results[4])
  });
}
