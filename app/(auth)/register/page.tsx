'use client';

import type React from 'react';
import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth-client';

import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Truck
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CODIGO_LOJA = '367';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (codigoVerificacao !== CODIGO_LOJA) {
      setError(
        'Código de verificação inválido. Entre em contato com o administrador.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password
      });

      if (result.error) {
        setError(result.error.message || 'Erro ao criar conta');
      } else {
        router.push('/login');
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background flex'>
      {/* Left — Brand panel */}
      <div className='hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-zinc-950'>
        <div className='absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/6 to-transparent' />

        <div className='relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground'>
              <Truck className='w-5 h-5' />
            </div>
            <span className='text-lg font-semibold text-white tracking-tight'>
              Igne System
            </span>
          </div>

          <div className='max-w-lg'>
            <h1 className='text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight'>
              Comece a{' '}
              <span className='text-primary'>organizar.</span>
            </h1>
            <p className='mt-6 text-zinc-400 text-lg leading-relaxed max-w-sm'>
              Crie sua conta e tenha controle total sobre estoque, clientes e
              ordens de serviço.
            </p>
          </div>

          <p className='text-xs text-zinc-600'>
            © 2025 Igne System
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-12'>
        <div className='w-full max-w-sm'>
          {/* Mobile logo */}
          <div className='flex lg:hidden items-center gap-3 mb-12'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground'>
              <Truck className='w-5 h-5' />
            </div>
            <span className='text-lg font-semibold text-foreground'>
              Igne System
            </span>
          </div>

          <div className='space-y-2 mb-8'>
            <h2 className='text-2xl font-bold text-foreground'>
              Criar sua conta
            </h2>
            <p className='text-muted-foreground'>
              Preencha os dados abaixo para começar
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='name'>Nome completo</FieldLabel>
                <Input
                  id='name'
                  type='text'
                  placeholder='Seu nome'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input
                  id='email'
                  type='email'
                  placeholder='seu@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='password'>Senha</FieldLabel>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    className='pr-12'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'>
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
                <FieldDescription>Mínimo de 8 caracteres</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor='codigoVerificacao'>
                  Código de verificação
                </FieldLabel>
                <Input
                  id='codigoVerificacao'
                  type='text'
                  placeholder='Digite o código da loja'
                  value={codigoVerificacao}
                  onChange={(e) => setCodigoVerificacao(e.target.value)}
                  required
                  disabled={loading}
                />
                <FieldDescription>
                  Solicite o código ao administrador
                </FieldDescription>
              </Field>

              {error ? (
                <Alert variant='destructive'>
                  <AlertCircle />
                  <AlertTitle>Falha ao criar conta</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type='submit'
                className='w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md group'
                disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar minha conta
                    <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform' />
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          <p className='mt-8 text-center text-sm text-muted-foreground'>
            Já tem uma conta?{' '}
            <Link
              href='/login'
              aria-disabled={loading}
              tabIndex={loading ? -1 : undefined}
              className={`text-primary font-medium ${loading ? 'pointer-events-none opacity-50' : 'hover:underline'}`}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
