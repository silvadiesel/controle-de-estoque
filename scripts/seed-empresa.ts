/**
 * Seed da tabela `empresa` (singleton).
 *
 * Insere o registro único da empresa dona desta instância, com id = 1
 * (singleton enforced por CHECK constraint). Se já existir, o script
 * apenas imprime o registro atual e encerra — nada é sobrescrito.
 *
 * Uso:
 *   pnpm db:seed:empresa                              # com valores placeholder
 *   EMPRESA_NOME="Silva Diesel" EMPRESA_CNPJ="..." pnpm db:seed:empresa
 *
 * Os dados podem ser editados depois pela aba "Dados Cadastrais" em
 * /configuracoes (admin).
 */
import { empresa, EMPRESA_SINGLETON_ID } from '../db/schema';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não definido.');
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

function gerarCodigo(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function seedEmpresa() {
  const existente = await db
    .select()
    .from(empresa)
    .where(eq(empresa.id, EMPRESA_SINGLETON_ID));

  if (existente.length > 0) {
    console.log('Empresa já cadastrada, nada a fazer:');
    console.log(existente[0]);
    return;
  }

  const nomeFantasia = process.env.EMPRESA_NOME ?? 'Empresa Exemplo';
  const cnpj = process.env.EMPRESA_CNPJ ?? '00000000000000';
  const cidade = process.env.EMPRESA_CIDADE ?? 'Cidade Exemplo';
  const estado = (process.env.EMPRESA_ESTADO ?? 'SC').slice(0, 2).toUpperCase();
  const codigoVerificacao = gerarCodigo();

  const [inserida] = await db
    .insert(empresa)
    .values({
      id: EMPRESA_SINGLETON_ID,
      nomeFantasia,
      cnpj,
      cidade,
      estado,
      codigoVerificacao
    })
    .returning();

  console.log('Empresa cadastrada:');
  console.log(inserida);
  console.log(
    '\nAjuste os dados cadastrais pela aba "Dados Cadastrais" em /configuracoes.'
  );
}

seedEmpresa()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end({ timeout: 5 });
  });
