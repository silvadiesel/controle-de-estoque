import type { ReactNode } from 'react';

import Image from 'next/image';

import { Boxes, Gauge, type LucideIcon, ShieldCheck } from 'lucide-react';

type HeroHighlight = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type AuthShellProps = {
  formTitle: string;

  mobileMessage: string;

  footer?: ReactNode;
  children: ReactNode;
};

const HERO_HIGHLIGHTS: HeroHighlight[] = [
  {
    title: 'Tudo em um so lugar',
    description:
      'Acompanhe estoque, atendimentos, clientes e fornecedores sem depender de processos soltos.',
    icon: Boxes
  },
  {
    title: 'Mais controle para crescer',
    description:
      'Tenha uma operação mais previsível, com menos retrabalho e mais clareza para decidir.',
    icon: Gauge
  },
  {
    title: 'Rotina mais profissional',
    description:
      'Organize o dia a dia da empresa com uma experiência moderna, direta e focada em execução.',
    icon: ShieldCheck
  }
];

export function AuthShell({
  formTitle,
  mobileMessage,
  footer,
  children
}: AuthShellProps) {
  return (
    <div className='relative min-h-screen overflow-hidden bg-background text-foreground'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_62%,rgba(91,127,165,0.18),transparent_28%),radial-gradient(circle_at_52%_34%,rgba(91,127,165,0.08),transparent_20%),radial-gradient(circle_at_78%_54%,rgba(91,127,165,0.12),transparent_22%),linear-gradient(135deg,#090b10_0%,#05070b_48%,#040508_100%)]' />

      <div className='relative grid min-h-screen lg:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.9fr)]'>
        <section className='relative hidden overflow-hidden border-b border-border lg:block lg:border-r lg:border-b-0'>
          <div className='absolute inset-0 hidden lg:block'>
            <div className='absolute -bottom-16 -left-20 h-72 w-72 rounded-full bg-primary/14 blur-3xl' />
            <div className='absolute right-[14%] top-[18%] h-80 w-80 rounded-full bg-primary/10 blur-3xl' />
            <div className='absolute left-[12%] top-0 h-full w-px rotate-[8deg] bg-linear-to-b from-transparent via-primary/22 to-transparent' />
            <div className='absolute left-[42%] top-0 h-full w-px rotate-[9deg] bg-linear-to-b from-transparent via-primary/14 to-transparent' />
            <div className='absolute right-[24%] top-0 h-full w-px -rotate-6 bg-linear-to-b from-transparent via-primary/18 to-transparent' />
          </div>

          <div className='relative flex h-full flex-col justify-center gap-20 px-20'>
            <div className='flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center'>
                <Image
                  src='/img/main_icon.svg'
                  alt='Logo do Igne System'
                  width={40}
                  height={40}
                  className='h-full w-full object-contain'
                  priority
                />
              </div>

              <div>
                <p className='text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                  Igne System
                </p>
                <p className='mt-1 text-xs uppercase tracking-[0.28em] text-primary/80'>
                  Controle inteligente
                </p>
              </div>
            </div>

            <div className='max-w-2xl'>
              <p className='text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-foreground'>
                Cresça com controle em cada etapa da{' '}
                <span className='text-primary'>operação.</span>
              </p>

              <p className='mt-6 leading-8 text-muted-foreground sm:text-xl'>
                Centralize estoque, ordens de serviço, clientes e fornecedores
                em um sistema pensado para dar visibilidade, ritimo e
                consistência ao seu negócio.
              </p>

              <div className='mt-8 grid gap-4 max-w-2xl'>
                {HERO_HIGHLIGHTS.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className='flex gap-4 rounded-[1.6rem] border border-border bg-card/50 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm '>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/14 bg-primary/10 text-primary'>
                      <Icon className='h-7 w-7' />
                    </div>

                    <div>
                      <p className='text-base font-semibold text-foreground '>
                        {title}
                      </p>
                      <p className='mt-1 text-sm leading-6 text-muted-foreground sm:text-base'>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className='relative flex items-center justify-center '>
          <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,12,0.96),rgba(5,8,12,0.985)),radial-gradient(circle_at_top_left,rgba(91,127,165,0.09),transparent_26%)]' />

          <div className='relative w-full max-w-[420px] px-6 md:px-0'>
            <div className='mb-10 lg:hidden'>
              <div className='flex items-center gap-3'>
                <div className='flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-primary/15 bg-card/50 p-3 shadow-[0_16px_32px_rgba(91,127,165,0.14)] backdrop-blur-sm'>
                  <Image
                    src='/img/main_icon.svg'
                    alt='Logo do Igne System'
                    width={36}
                    height={36}
                    className='h-full w-full object-contain'
                    priority
                  />
                </div>

                <div>
                  <p className='text-2xl font-semibold tracking-tight text-foreground'>
                    Igne System
                  </p>
                  <p className='mt-1 text-xs uppercase tracking-[0.24em] text-primary/80'>
                    Controle inteligente
                  </p>
                </div>
              </div>

              <p className='mt-6 max-w-sm text-sm leading-6 text-muted-foreground md:flex hidden'>
                {mobileMessage}
              </p>
            </div>

            <div className='mb-8 space-y-3'>
              <h1 className='text-4xl font-semibold tracking-[-0.05em] text-foreground'>
                {formTitle}
              </h1>
            </div>

            {children}

            {footer ? (
              <div className='mt-8 text-center text-sm text-muted-foreground'>
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
