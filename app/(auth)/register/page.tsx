'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/auth-client';

import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    <Card className='w-full max-w-md relative z-10 backdrop-blur-sm bg-card/95'>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-2xl font-bold tracking-tight'>
          Criar Conta
        </CardTitle>
        <CardDescription>
          Preencha os dados abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4'>
          {error && (
            <div className='p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20'>
              {error}
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome</Label>
            <Input
              id='name'
              type='text'
              placeholder='Seu nome'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='seu@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Senha</Label>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <p className='text-xs text-muted-foreground'>
              Mínimo de 8 caracteres
            </p>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
          <p className='text-sm text-muted-foreground text-center'>
            Já tem uma conta?{' '}
            <Link
              href='/login'
              className='text-primary hover:underline font-medium'>
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
