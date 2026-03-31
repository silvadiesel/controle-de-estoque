import 'dotenv/config';

import * as schema from './schema';
import postgres from 'postgres';

import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';

import {
  RESET_TABLE_NAMES,
  SEED_COUNTS,
  buildVehicleTargets,
  createSeededRandom,
  pickExistingUserId,
  pickManyUnique,
  pickOne,
  randomInt
} from './seed-config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL nao definido.');
}

if (process.env.CONFIRM_PROD_RESET !== 'SIM') {
  throw new Error(
    'Execucao bloqueada. Defina CONFIRM_PROD_RESET=SIM para limpar e reseedar o banco.'
  );
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

type SeedDb = typeof db;
type Tx = Parameters<Parameters<SeedDb['transaction']>[0]>[0];

type PieceState = {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
};

const random = createSeededRandom(20260331);

const categoryNames = [
  'Filtros',
  'Freios',
  'Suspensao',
  'Motor',
  'Lubrificantes',
  'Eletrica',
  'Arrefecimento',
  'Transmissao',
  'Pneumatica',
  'Acessorios'
] as const;

const supplierNames = [
  'Auto Pecas Horizonte',
  'Distribuidora Ponto Diesel',
  'Centro Automotivo Brasil Sul',
  'Norte Rodas e Motores',
  'Pecas Sao Cristovao',
  'Conexao Diesel Campinas',
  'Estoque Forte Autopecas',
  'Linha Pesada Nordeste',
  'Mecanica Boa Estrada',
  'Prime Auto Truck'
] as const;

const clientProfiles = [
  ['Joao Silva', 'Transportadora Silva'],
  ['Maria Oliveira', 'Logistica Oliveira'],
  ['Carlos Souza', 'Frota Souza'],
  ['Ana Martins', 'Martins Entregas'],
  ['Pedro Santos', 'Santos Cargas'],
  ['Fernanda Lima', 'Lima Transportes'],
  ['Ricardo Almeida', 'Almeida Distribuicao'],
  ['Juliana Costa', 'Costa Express'],
  ['Bruno Pereira', 'Pereira Auto Service'],
  ['Patricia Rocha', 'Rocha Rotas']
] as const;

const vehicleModels = [
  'Volkswagen Delivery 11.180',
  'Mercedes-Benz Accelo 1016',
  'Ford Transit Furgao',
  'Fiat Ducato Cargo',
  'Renault Master L3H2',
  'Iveco Daily 35-160',
  'Volkswagen Saveiro Robust',
  'Chevrolet S10 Cabine Simples',
  'Hyundai HR',
  'Mercedes-Benz Sprinter 417'
] as const;

const pieceNames = [
  'Filtro de oleo premium',
  'Pastilha de freio dianteira',
  'Disco de freio ventilado',
  'Amortecedor reforcado traseiro',
  'Correia do alternador',
  'Bomba dagua linha pesada',
  'Kit embreagem completo',
  'Rolamento de roda dianteiro',
  'Radiador aluminio compacto',
  'Sensor de temperatura motor',
  'Terminal de direcao externo',
  'Jogo de velas iridium',
  'Filtro de combustivel diesel',
  'Cubo de roda traseiro',
  'Bieleta estabilizadora',
  'Cilindro mestre de freio',
  'Pivo de suspensao superior',
  'Mangueira do radiador',
  'Alternador 120A',
  'Motor de partida 12V'
] as const;

const shelfLocations = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'D2'] as const;

const saleNotes = [
  'Venda gerada para reposicao de estoque da frota.',
  'Pedido fechado com retirada no balcao.',
  'Compra recorrente para manutencao preventiva.',
  'Venda negociada com pagamento faturado.',
  'Separacao concluida para entrega programada.'
] as const;

const serviceNotes = [
  'Veiculo entrou para revisao preventiva completa.',
  'Ordem aberta para troca de conjunto de freios.',
  'Servico agendado apos apontamento de vazamento.',
  'Atendimento com foco em ruido na suspensao.',
  'Checklist de oficina solicitado pelo cliente.'
] as const;

function cents(value: number): number {
  return Math.round(value * 100);
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function padNumber(value: number, size: number): string {
  return value.toString().padStart(size, '0');
}

function buildCpf(index: number): string {
  return digitsOnly(`1234567${padNumber(index + 1, 4)}`);
}

function buildCnpj(index: number): string {
  return digitsOnly(`123456780001${padNumber(index + 1, 2)}`);
}

function buildPhone(index: number): string {
  return digitsOnly(`1194000${padNumber(index + 1, 4)}`);
}

function buildPlate(clientIndex: number, vehicleIndex: number): string {
  const letters = String.fromCharCode(65 + (clientIndex % 26));
  const second = String.fromCharCode(65 + ((clientIndex + vehicleIndex + 3) % 26));
  const third = String.fromCharCode(65 + ((clientIndex + vehicleIndex + 7) % 26));
  return `${letters}${second}${third}${clientIndex % 10}${vehicleIndex}2${(clientIndex + vehicleIndex) % 10}`;
}

function randomDateWithinPast(days: number): Date {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - randomInt(0, days, random));
  return date;
}

async function getProtectedCounts() {
  const [users, accounts, sessions] = await Promise.all([
    db.$count(schema.user),
    db.$count(schema.account),
    db.$count(schema.session)
  ]);

  return { users, accounts, sessions };
}

async function getBusinessCounts() {
  const [
    categorias,
    fornecedor,
    cliente,
    veiculo,
    pecas,
    ordemVenda,
    ordemVendaPecas,
    ordemServico,
    ordemServicoPecas,
    movimentacoes
  ] = await Promise.all([
    db.$count(schema.categorias),
    db.$count(schema.fornecedor),
    db.$count(schema.cliente),
    db.$count(schema.veiculo),
    db.$count(schema.pecas),
    db.$count(schema.ordemVenda),
    db.$count(schema.ordemVendaPecas),
    db.$count(schema.ordemServico),
    db.$count(schema.ordemServicoPecas),
    db.$count(schema.movimentacoes)
  ]);

  return {
    categorias,
    fornecedor,
    cliente,
    veiculo,
    pecas,
    ordemVenda,
    ordemVendaPecas,
    ordemServico,
    ordemServicoPecas,
    movimentacoes
  };
}

function buildOrderItems(pieceState: PieceState[]) {
  const availablePieces = pieceState.filter((piece) => piece.quantidade > 0);

  if (availablePieces.length === 0) {
    throw new Error('Estoque insuficiente para gerar as ordens.');
  }

  const itemCount = randomInt(1, Math.min(3, availablePieces.length), random);
  const selectedPieces = pickManyUnique(availablePieces, itemCount, random);

  return selectedPieces.map((piece) => {
    const quantity = randomInt(1, Math.min(4, piece.quantidade), random);

    piece.quantidade -= quantity;

    return {
      peca_id: piece.id,
      quantidade: quantity,
      preco: piece.preco
    };
  });
}

function buildAssignedUsers(userIds: string[]) {
  const funcionarioId = pickExistingUserId(userIds, random);

  if (userIds.length === 1) {
    return {
      funcionarioId,
      responsavelId: funcionarioId
    };
  }

  let responsavelId = pickExistingUserId(userIds, random);

  if (responsavelId === funcionarioId) {
    responsavelId = userIds.find((userId) => userId !== funcionarioId) ?? funcionarioId;
  }

  return {
    funcionarioId,
    responsavelId
  };
}

async function resetBusinessTables(tx: Tx) {
  const tables = RESET_TABLE_NAMES.map((tableName) => `"${tableName}"`).join(', ');
  await tx.execute(sql.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE;`));
}

async function seedDatabase() {
  const protectedBefore = await getProtectedCounts();

  console.log('Contagem auth antes do reset:', protectedBefore);

  await db.transaction(async (tx) => {
    await resetBusinessTables(tx);

    const users = await tx.select({ id: schema.user.id }).from(schema.user);
    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      throw new Error('Nao foi encontrado nenhum user para relacionar as ordens.');
    }

    const insertedCategories = await tx
      .insert(schema.categorias)
      .values(
        categoryNames.map((name) => ({
          name,
          status: true
        }))
      )
      .returning({ id: schema.categorias.id, name: schema.categorias.name });

    const insertedSuppliers = await tx
      .insert(schema.fornecedor)
      .values(
        supplierNames.map((nameEmpresa, index) => ({
          name_empresa: nameEmpresa,
          cnpj: buildCnpj(index),
          status: index % 4 !== 0,
          telefone: buildPhone(index),
          email: `contato${index + 1}@${nameEmpresa.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.com.br`
        }))
      )
      .returning({ id: schema.fornecedor.id, name_empresa: schema.fornecedor.name_empresa });

    const insertedClients = await tx
      .insert(schema.cliente)
      .values(
        clientProfiles.map(([nameCliente, nomeEmpresa], index) => ({
          name_cliente: nameCliente,
          nome_empresa: nomeEmpresa,
          cnpj: buildCnpj(index + 20),
          cpf: buildCpf(index),
          telefone: buildPhone(index + 20),
          status: index % 5 !== 0,
          id_veiculos: []
        }))
      )
      .returning({ id: schema.cliente.id, name_cliente: schema.cliente.name_cliente });

    const vehicleTargets = buildVehicleTargets(insertedClients.length, random);
    const vehiclesToInsert = insertedClients.flatMap((clientRow, clientIndex) =>
      Array.from({ length: vehicleTargets[clientIndex] ?? 2 }, (_, vehicleIndex) => ({
        placa: buildPlate(clientIndex, vehicleIndex),
        modelo: pickOne(vehicleModels, random),
        status: vehicleIndex % 3 !== 0,
        cliente_id: clientRow.id
      }))
    );

    const insertedVehicles = await tx
      .insert(schema.veiculo)
      .values(vehiclesToInsert)
      .returning({ id: schema.veiculo.id, cliente_id: schema.veiculo.cliente_id });

    for (const clientRow of insertedClients) {
      const vehicleIds = insertedVehicles
        .filter((vehicle) => vehicle.cliente_id === clientRow.id)
        .map((vehicle) => vehicle.id);

      await tx
        .update(schema.cliente)
        .set({ id_veiculos: vehicleIds })
        .where(eq(schema.cliente.id, clientRow.id));
    }

    const insertedPieces = await tx
      .insert(schema.pecas)
      .values(
        Array.from({ length: SEED_COUNTS.pecas }, (_, index) => ({
          name_peca: pieceNames[index] ?? `Peca ${index + 1}`,
          codigo: `PEC-${padNumber(index + 1, 4)}`,
          categoria_id: pickOne(insertedCategories, random).id,
          quantidade: randomInt(18, 42, random),
          preco: cents(randomInt(35, 380, random) + 0.9),
          fornecedor_id: pickOne(insertedSuppliers, random).id,
          localizacao: [pickOne(shelfLocations, random)],
          imagem: null,
          alerta: randomInt(2, 8, random)
        }))
      )
      .returning({
        id: schema.pecas.id,
        name_peca: schema.pecas.name_peca,
        quantidade: schema.pecas.quantidade,
        preco: schema.pecas.preco
      });

    const pieceState: PieceState[] = insertedPieces.map((piece) => ({
      id: piece.id,
      nome: piece.name_peca,
      preco: piece.preco,
      quantidade: piece.quantidade
    }));

    for (let index = 0; index < SEED_COUNTS.ordemVenda; index += 1) {
      const clientRow = pickOne(insertedClients, random);
      const items = buildOrderItems(pieceState);
      const totalValue = items.reduce(
        (sum, item) => sum + item.preco * item.quantidade,
        0
      );
      const saleDate = randomDateWithinPast(90);
      const isClosed = index % 3 !== 0;

      const [orderRow] = await tx
        .insert(schema.ordemVenda)
        .values({
          data_pagamento: isClosed ? saleDate : null,
          data_previsao_pagamento: isClosed ? null : randomDateWithinPast(15),
          status: isClosed ? 'fechada' : 'ativa',
          cliente_id: clientRow.id,
          observacao: pickOne(saleNotes, random),
          valor_total: totalValue,
          metodo_pagamento: isClosed
            ? pickOne(['pix', 'boleto', 'debito', 'credito', 'dinheiro'] as const, random)
            : null
        })
        .returning({ id: schema.ordemVenda.id });

      await tx.insert(schema.ordemVendaPecas).values(
        items.map((item) => ({
          ordem_venda_id: orderRow.id,
          peca_id: item.peca_id,
          quantidade: item.quantidade
        }))
      );
    }

    for (let index = 0; index < SEED_COUNTS.ordemServico; index += 1) {
      const clientRow = pickOne(insertedClients, random);
      const clientVehicles = insertedVehicles.filter(
        (vehicle) => vehicle.cliente_id === clientRow.id
      );
      const { funcionarioId, responsavelId } = buildAssignedUsers(userIds);
      const items = buildOrderItems(pieceState);
      const totalValue = items.reduce(
        (sum, item) => sum + item.preco * item.quantidade,
        0
      );
      const arrivalDate = randomDateWithinPast(120);
      const isClosed = index % 4 !== 0;

      const [orderRow] = await tx
        .insert(schema.ordemServico)
        .values({
          data_chegada: arrivalDate,
          data_saida: isClosed ? randomDateWithinPast(30) : null,
          status: isClosed ? 'fechada' : 'ativa',
          cliente_id: clientRow.id,
          veiculo_id: pickOne(clientVehicles, random).id,
          funcionario_id: funcionarioId,
          funcionario_responsavel_id: responsavelId,
          observacao: pickOne(serviceNotes, random),
          valor_total: totalValue
        })
        .returning({ id: schema.ordemServico.id });

      await tx.insert(schema.ordemServicoPecas).values(
        items.map((item) => ({
          ordem_servico_id: orderRow.id,
          peca_id: item.peca_id,
          quantidade: item.quantidade
        }))
      );
    }

    for (const piece of pieceState) {
      await tx
        .update(schema.pecas)
        .set({ quantidade: piece.quantidade })
        .where(eq(schema.pecas.id, piece.id));
    }
  });

  const protectedAfter = await getProtectedCounts();
  const businessAfter = await getBusinessCounts();

  if (JSON.stringify(protectedBefore) !== JSON.stringify(protectedAfter)) {
    throw new Error('As tabelas protegidas de auth foram alteradas, abortando.');
  }

  console.log('Contagem auth apos o reset:', protectedAfter);
  console.log('Contagem tabelas de negocio apos seed:', businessAfter);
}

seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end({ timeout: 5 });
  });
