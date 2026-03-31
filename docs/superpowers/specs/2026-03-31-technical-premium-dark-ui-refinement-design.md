# Technical Premium Dark UI Refinement - Design Spec

## Summary

Refinar o sistema visual do app preservando a estrutura atual, com foco em legibilidade operacional, consistencia sistêmica e robustez visual. O resultado deve parecer tecnico, premium e preciso, sem light mode, sem rings visuais e sem cair em estetica generica de dashboard escuro.

## Problem

O app tem base de tema e componentes pronta, mas o sistema visual esta fragmentado:

- `app/globals.css` mistura tokens semanticos corretos com redundancia e tipografia comprimida.
- Varias telas ignoram o tema e usam `zinc`, hex e `rgba` avulsos.
- Sidebar, auth e dashboard nao parecem partes do mesmo produto.
- Estados de erro, vazio e carregamento ainda se confundem em pontos criticos.
- Em telas operacionais, o texto esta pequeno demais e algumas linhas/listas nao suportam dados reais com seguranca.

## Approved Direction

- Preservar a estrutura atual das rotas e das telas.
- Trabalhar primeiro o sistema visual base, depois sidebar, dashboard e formularios prioritarios.
- Assumir dark mode only como restricao permanente.
- Comunicar foco, hover e ativo sem ring visual dominante.
- Priorizar leitura e identificacao imediata sobre ornamentacao.
- Esta spec substitui a direcao parcial registrada em `docs/superpowers/specs/2026-03-31-theme-contrast-fix-design.md` quando houver conflito de decisao.

## Goals

1. Unificar o dark mode em um sistema coerente de tokens e superficies.
2. Subir a qualidade tipografica para uso operacional real.
3. Dar identidade propria ao app sem glow, gradiente gratuito ou cardizacao repetitiva.
4. Corrigir pontos de fragilidade visual e de UX em dashboard, listas e formularios.
5. Reaproximar as telas do uso recomendado pelo shadcn: semantica primeiro, overrides locais por excecao.

## Non-Goals

- Nao criar light mode.
- Nao redesenhar a arquitetura de navegacao.
- Nao trocar rotas, entidades ou fluxos principais.
- Nao fazer rebranding completo.
- Nao transformar o app em interface maximalista ou experimental.

## Design Principles

### 1. Operational Readability First
Dados, estados e acoes principais devem ser identificados em um olhar. A escala tipografica, contraste e espacamento devem favorecer varredura rapida em contexto de operacao.

### 2. Premium Through Precision
O visual premium vira de controle, ritmo e materialidade de superficie, nao de efeitos chamativos. Bordas, contraste, alinhamento e ritmo devem carregar essa sensacao.

### 3. One Theme, Many Screens
Sidebar, dashboard, auth e formularios devem compartilhar a mesma linguagem de superficies, contraste e tipografia.

### 4. System Over Local Styling
O tema deve sair de `app/globals.css` e dos componentes base. Classes visuais locais devem diminuir fortemente.

### 5. States Must Be Explicit
Loading, vazio, sucesso, erro, ativo e indisponivel precisam ser distintos tanto visualmente quanto semanticamente.

## Visual System

### Color Strategy

- Usar base escura fria, evitando preto puro e cinza neutro morto.
- Separar com clareza:
  - `background`: plano mais profundo
  - `card`: superficie principal
  - `elevated`: superficie de destaque ou agrupamento interno
  - `sidebar`: superficie propria, coerente com o resto mas nao identica
  - `border` e `border-hover`: delimitacao discreta e funcional
- Manter um acento primario azul-acero controlado, aplicado por funcao:
  - foco de leitura
  - estado ativo
  - chamadas primarias
  - destaque numerico quando necessario
- Evitar:
  - glow
  - gradiente decorativo
  - azul espalhado em elementos sem peso funcional
  - hex e `rgba` hardcoded nas telas

### Typography Strategy

- Manter uma familia principal unica, coerente com o carregamento real do app.
- Subir a hierarquia atual, hoje comprimida em `10/12/13/15px`.
- Definir papeis claros:
  - overline/label operacional
  - texto auxiliar
  - texto base
  - titulo de secao
  - dado numerico/destaque
- Dar tratamento explicito para numeros e metricas com `tabular-nums`.
- Melhorar legibilidade em dark UI com contraste mais consistente e alturas de linha menos apertadas.

Faixas alvo para implementacao:

- `label operacional`: `0.75rem` a `0.8125rem`, peso `600`, tracking discreto quando houver uppercase.
- `texto auxiliar`: `0.8125rem` a `0.875rem`, peso `400` a `500`.
- `texto base`: `0.9375rem` a `1rem`, peso `400` a `500`.
- `titulo de secao/card`: `1.125rem` a `1.25rem`, peso `600` a `700`.
- `dado numerico/destaque`: `1.625rem` a `2rem`, peso `700`, sempre com `tabular-nums` quando comparacao visual importar.

### Interaction Strategy

- Sem rings visuais aparentes.
- Hover, foco e ativo devem ser comunicados por combinacao controlada de:
  - borda
  - mudanca de superficie
  - sombra interna/externa discreta
  - contraste de texto/icone
- Elementos clicaveis precisam ser obvios sem parecerem chamativos.

Regras minimas por categoria:

- `Button` e acoes iconicas: hover por mudanca de superficie; foco por borda/sombra discreta de alto contraste; estado ativo por superficie mais densa e texto/icone mais forte.
- `Input`, `Select` e controles de formulario: foco por reforco de borda e leve elevacao de superficie, sem halo externo dominante; erro por borda/icone/mensagem, nao so por cor de fundo.
- Links e acoes textuais: hover por contraste e sublinhado seletivo quando fizer sentido; foco visivel por mudanca clara de cor e contorno discreto.
- Sidebar e navegacao: item ativo por superficie propria e icone/texto reforcados; foco teclado precisa ficar perceptivel mesmo sem mouse.

## Scope By Area

### 1. Global Theme And Base Components

Arquivos alvo iniciais:

- `app/globals.css`
- `app/layout.tsx`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/sidebar.tsx` apenas se `components/app-sidebar.tsx` nao for suficiente para alinhar foco, hover e ativo

Decisoes:

- Consolidar tokens duplicados de texto e superficie.
- Redefinir a escala tipografica utilitaria do app.
- Alinhar `--font-sans` com a fonte efetivamente carregada em `app/layout.tsx`.
- Remover dependencia visual de `focus-visible:ring-*` nos componentes base.
- Preservar acessibilidade por borda/contraste/fundo, nao por ring.

### 2. Sidebar

Arquivo alvo inicial:

- `components/app-sidebar.tsx`

Decisoes:

- Reduzir microtipografia arbitraria.
- Tornar estado ativo mais funcional e menos generico.
- Melhorar legibilidade dos grupos, usuario e contadores.
- Remover gradiente gratuito do logo se ele continuar soando ornamental.

### 3. Dashboard

Arquivos alvo iniciais:

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/dashboard/_components/stat-card.tsx`
- `app/(dashboard)/dashboard/_components/movements-chart.tsx`
- `app/(dashboard)/dashboard/_components/activity-feed.tsx`
- `app/(dashboard)/dashboard/_components/last-orders.tsx`

Decisoes:

- Manter `stat-card` como card compacto, mas tratar grafico, atividade e ultimas ordens como superficies mais amplas e menos repetitivas.
- Subir peso informacional de metricas, atividade e ordens recentes.
- Diferenciar claramente:
  - carregando
  - sem dados
  - falha parcial
  - falha total
- Nao exibir `0` como se fosse dado valido quando a API falhar.

Matriz minima de estados:

- `dashboard/page.tsx`: deve computar e expor `loading inicial`, `sucesso completo`, `falha parcial` e `falha total`.
- `stat-card.tsx`: deve mostrar `skeleton` em loading, valor real em sucesso e estado de indisponibilidade quando o dado daquele card falhar.
- `movements-chart.tsx`, `activity-feed.tsx` e `last-orders.tsx`: cada componente deve distinguir `sem dados` de `dados indisponiveis`, sem depender apenas da pagina pai.
- `falha parcial`: a tela segue util, mas o bloco afetado nao pode fingir normalidade.
- `falha total`: a area principal precisa comunicar indisponibilidade e opcao clara de tentar novamente.

### 4. Auth And Forms

Arquivos alvo iniciais:

- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(dashboard)/produtos/_components/modal-peças.tsx`
- `app/(dashboard)/clientes/_components/modal-clientes.tsx`
- `app/(dashboard)/clientes/_components/modal-veiculos.tsx`

Decisoes:

- Preservar a composicao atual, mas alinhar auth ao mesmo sistema visual do dashboard.
- Diminuir overrides locais em `Input` e `Button`.
- Melhorar mensagens de erro, estados de loading e affordance de acoes.
- Revisar largura, grid, overflow e textos longos nos modais.

### 5. Dense Lists And Operational Rows

Arquivos alvo iniciais:

- `app/(dashboard)/clientes/page.tsx`
- `app/(dashboard)/produtos/page.tsx`
- nesta primeira onda, somente essas duas telas; expandir para equivalentes apenas se o ajuste for naturalmente herdado por componente compartilhado

Decisoes:

- Garantir `min-w-0`, `truncate`, quebra controlada e distribuicao de espaco mais robusta.
- Revisar alvos de toque pequenos em acoes iconicas.
- Tornar vazios e carregamentos mais claros e menos improvisados.

## Hardening Requirements

### Data And States

- O dashboard deve distinguir erro de ausencia de dados.
- Listas e formularios devem suportar nomes, emails, documentos e placas longos.
- Estados vazios precisam orientar proximo passo, nao apenas informar ausencia.
- Erros em auth devem ser anunciados semanticamente e nao apenas coloridos.
- Submit duplo deve ser prevenido em auth e modais prioritarios.

### Responsive And Density

- O app precisa continuar funcional em larguras menores sem amputar acoes criticas.
- Linhas densas devem priorizar conteudo principal e colapsar secundarios com criterio.
- Modais precisam suportar conteudo longo sem quebrar layout nem gerar aperto inutil.

### Accessibility

- Foco visivel sem ring dominante.
- Alvos de toque operacionais com dimensao segura.
- Contraste de texto e estado consistente em dark mode.
- `role="alert"` / `aria-live` para erros relevantes de formulario quando aplicavel.
- Verificacao minima de foco por teclado em `Button`, `Input`, links de auth e itens da sidebar.

## shadcn Rules To Preserve

- Preferir tokens e variantes semanticas a classes visuais soltas.
- Evitar `space-y-*` em novas composicoes; usar `gap-*`.
- Evitar tamanho manual de icone dentro de componentes quando o proprio componente ja resolve.
- Usar componentes existentes para vazios, skeletons e feedback quando couber.
- Nao estilizar `className` como atalho para fugir do sistema global.

## Implementation Order

1. Tema global e componentes base.
2. Sidebar.
3. Dashboard.
4. Auth.
5. Formularios e modais prioritarios.
6. Passo final de consistencia, overflow e estados.

## Verification

- Revisar o app em dark mode completo, sem regressao de contraste util.
- Verificar telas de operacao com textos longos e dados ausentes.
- Confirmar que hover, foco e ativo continuam perceptiveis sem rings.
- Validar que dashboard nao mascara falha de API como metrica real.
- Rodar `eslint` e checagens locais relevantes antes de concluir.

Cenarios minimos obrigatorios:

- nome de cliente com mais de 60 caracteres
- CPF/CNPJ e telefone longos nas linhas de clientes
- placa e modelo longos nos veiculos
- erro parcial em uma ou mais APIs do dashboard
- erro total no dashboard
- erro de auth com mensagem visivel e anunciada
- submit duplo em login e modais prioritarios
- largura mobile estreita com acoes iconicas ainda utilizaveis

## Success Criteria

- O app passa a parecer uma ferramenta tecnica premium unica, nao um dashboard escuro generico.
- A leitura melhora sensivelmente em sidebar, dashboard e formularios.
- O tema volta a ser a origem principal do visual.
- Estados criticos ficam mais confiaveis para uso operacional.
