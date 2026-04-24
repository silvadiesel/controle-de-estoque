import { db, schema } from '@/db';
import { EMPRESA_SINGLETON_ID } from '@/db/schema/empresa';
import { requireRoutePermission } from '@/lib/server/access-control';

import { aliasedTable, eq } from 'drizzle-orm';

type Params = { params: Promise<{ tipo: string; id: string }> };

export async function GET(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'view_ordens');
  if (permissionCheck instanceof Response) return permissionCheck;

  const { tipo, id } = await params;
  const ordemId = parseInt(id);

  if (tipo !== 'servico' && tipo !== 'venda') {
    return new Response(JSON.stringify({ error: 'Tipo inválido' }), {
      status: 400
    });
  }

  // Buscar dados da empresa
  const [empresa] = await db
    .select()
    .from(schema.empresa)
    .where(eq(schema.empresa.id, EMPRESA_SINGLETON_ID));

  if (tipo === 'servico') {
    const funcionarioResponsavel = aliasedTable(
      schema.user,
      'funcionario_responsavel'
    );

    const ordem = await db
      .select({
        id: schema.ordemServico.id,
        data_criacao: schema.ordemServico.data_criacao,
        data_chegada: schema.ordemServico.data_chegada,
        data_saida: schema.ordemServico.data_saida,
        status: schema.ordemServico.status,
        observacao: schema.ordemServico.observacao,
        valor_total: schema.ordemServico.valor_total,
        valor_mao_obra: schema.ordemServico.valor_mao_obra,
        cliente: {
          
          nome_empresa: schema.cliente.nome_empresa,
          cnpj: schema.cliente.cnpj,
          cpf: schema.cliente.cpf,
          telefone: schema.cliente.telefone
        },
        veiculo: {
          placa: schema.veiculo.placa,
          modelo: schema.veiculo.modelo
        },
        funcionario_responsavel: {
          name: funcionarioResponsavel.name
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
      .leftJoin(
        funcionarioResponsavel,
        eq(
          schema.ordemServico.funcionario_responsavel_id,
          funcionarioResponsavel.id
        )
      )
      .where(eq(schema.ordemServico.id, ordemId))
      .limit(1);

    if (ordem.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Ordem não encontrada' }),
        { status: 404 }
      );
    }

    const pecas = await db
      .select({
        id: schema.ordemServicoPecas.id,
        quantidade: schema.ordemServicoPecas.quantidade,
        peca: {
          name_peca: schema.pecas.name_peca,
          codigo: schema.pecas.codigo,
          preco: schema.pecas.preco
        }
      })
      .from(schema.ordemServicoPecas)
      .leftJoin(
        schema.pecas,
        eq(schema.ordemServicoPecas.peca_id, schema.pecas.id)
      )
      .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordemId));

    const maoObra = await db
      .select({
        id: schema.ordemServicoMaoObra.id,
        descricao: schema.ordemServicoMaoObra.descricao,
        valor: schema.ordemServicoMaoObra.valor
      })
      .from(schema.ordemServicoMaoObra)
      .where(eq(schema.ordemServicoMaoObra.ordem_servico_id, ordemId));

    return Response.json({
      tipo: 'servico',
      ordem: { ...ordem[0], pecas, mao_obra: maoObra },
      empresa
    });
  }

  // tipo === 'venda'
  const ordem = await db
    .select({
      id: schema.ordemVenda.id,
      data_criacao: schema.ordemVenda.data_criacao,
      data_pagamento: schema.ordemVenda.data_pagamento,
      data_previsao_pagamento: schema.ordemVenda.data_previsao_pagamento,
      status: schema.ordemVenda.status,
      observacao: schema.ordemVenda.observacao,
      valor_total: schema.ordemVenda.valor_total,
      metodo_pagamento: schema.ordemVenda.metodo_pagamento,
      cliente: {
        
        nome_empresa: schema.cliente.nome_empresa,
        cnpj: schema.cliente.cnpj,
        cpf: schema.cliente.cpf,
        telefone: schema.cliente.telefone
      }
    })
    .from(schema.ordemVenda)
    .leftJoin(
      schema.cliente,
      eq(schema.ordemVenda.cliente_id, schema.cliente.id)
    )
    .where(eq(schema.ordemVenda.id, ordemId))
    .limit(1);

  if (ordem.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Ordem não encontrada' }),
      { status: 404 }
    );
  }

  const pecas = await db
    .select({
      id: schema.ordemVendaPecas.id,
      quantidade: schema.ordemVendaPecas.quantidade,
      peca: {
        name_peca: schema.pecas.name_peca,
        codigo: schema.pecas.codigo,
        preco: schema.pecas.preco
      }
    })
    .from(schema.ordemVendaPecas)
    .leftJoin(
      schema.pecas,
      eq(schema.ordemVendaPecas.peca_id, schema.pecas.id)
    )
    .where(eq(schema.ordemVendaPecas.ordem_venda_id, ordemId));

  return Response.json({
    tipo: 'venda',
    ordem: { ...ordem[0], pecas },
    empresa
  });
}
