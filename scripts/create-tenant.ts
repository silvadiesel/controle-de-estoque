/**
 * Cria um novo tenant: insere a empresa (singleton) e o usuário admin inicial.
 *
 * Fluxo:
 *   1. Prompts interativos pelos dados da empresa e do admin
 *   2. Insere a empresa com um código de verificação gerado
 *   3. Chama `auth.api.signUpEmail` passando o código recém-criado
 *      (o hook `before` do Better Auth valida e aprova)
 *   4. Faz UPDATE do cargo do user criado para 'admin'
 *   5. Imprime as credenciais no terminal
 *
 * Uso:
 *   pnpm create-tenant
 *
 * IMPORTANTE: Este script deve ser rodado em um banco LIMPO, antes do primeiro
 * signup. Se a empresa já existir, o script aborta.
 */
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { db } from '../db';
import { empresa, user, EMPRESA_SINGLETON_ID } from '../db/schema';
import { auth } from '../lib/auth';
import 'dotenv/config';
import { eq } from 'drizzle-orm';

function gerarCodigo(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function prompt(rl: readline.Interface, label: string): Promise<string> {
  const value = (await rl.question(`${label}: `)).trim();
  if (!value) {
    throw new Error(`${label} é obrigatório`);
  }
  return value;
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('=== Criação de novo tenant ===\n');

    const existente = await db
      .select()
      .from(empresa)
      .where(eq(empresa.id, EMPRESA_SINGLETON_ID));

    if (existente.length > 0) {
      console.error(
        'ERRO: Já existe uma empresa cadastrada neste banco. Abortando.'
      );
      console.error('Empresa atual:', existente[0]);
      process.exitCode = 1;
      return;
    }

    console.log('Dados da empresa:');
    const nomeFantasia = await prompt(rl, 'Nome fantasia');
    const cnpj = await prompt(rl, 'CNPJ (só números)');
    const cidade = await prompt(rl, 'Cidade');
    const estadoRaw = await prompt(rl, 'Estado (UF, 2 letras)');
    const estado = estadoRaw.toUpperCase().slice(0, 2);
    if (estado.length !== 2) {
      throw new Error('Estado deve ter 2 caracteres');
    }

    console.log('\nDados do admin inicial:');
    const adminName = await prompt(rl, 'Nome completo');
    const adminEmail = await prompt(rl, 'Email');
    const adminPassword = await prompt(rl, 'Senha (mínimo 8 caracteres)');
    if (adminPassword.length < 8) {
      throw new Error('Senha deve ter no mínimo 8 caracteres');
    }

    const codigoVerificacao = gerarCodigo();

    console.log('\nInserindo empresa...');
    await db.insert(empresa).values({
      id: EMPRESA_SINGLETON_ID,
      nomeFantasia,
      cnpj,
      cidade,
      estado,
      codigoVerificacao
    });

    console.log('Criando usuário admin via Better Auth...');
    // Chamamos signUpEmail com o código da empresa — o hook `before` em
    // lib/auth.ts valida contra o registro recém-inserido e aprova.
    // O Better Auth cuida do hash scrypt, da entry em `account`, etc.
    // O cast é necessário porque `codigo` não está declarado em
    // additionalFields (é só um campo transiente lido pelo hook).
    await auth.api.signUpEmail({
      body: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        codigo: codigoVerificacao
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    console.log('Promovendo usuário para admin...');
    // O signup cria o user com cargo 'atendente' (default + input:false).
    // Promovemos para admin logo em seguida.
    await db
      .update(user)
      .set({ cargo: 'admin' })
      .where(eq(user.email, adminEmail));

    console.log('\n=== Tenant criado com sucesso ===');
    console.log(`Empresa: ${nomeFantasia}`);
    console.log(`Admin email: ${adminEmail}`);
    console.log(`Admin senha: ${adminPassword}`);
    console.log('\nCompartilhe as credenciais do admin com o cliente.');
    console.log(
      'O código de verificação fica visível para o admin na aba "Dados Cadastrais" em /configuracoes.'
    );
  } finally {
    rl.close();
  }
}

main()
  .catch((error) => {
    console.error('\nFalha ao criar tenant:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Encerra a conexão do postgres-js (exportada por db/index.ts via drizzle)
    // Precisa forçar o processo a sair.
    process.exit(process.exitCode ?? 0);
  });
