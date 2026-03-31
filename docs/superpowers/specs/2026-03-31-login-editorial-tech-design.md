# Login Editorial Tech Design

**Objetivo:** redesenhar `app/(auth)/login/page.tsx` e alinhar `app/(auth)/register/page.tsx` com a mesma experiencia dark, mais ampla e comercial, inspirada na referencia enviada pelo usuario, mas usando a identidade azul do produto e o logo real em `public/img/main_icon.svg`.

## Contexto

- Publico misto: equipe interna e usuarios externos.
- Sensacao desejada: agilidade moderna.
- A esquerda deve destacar beneficios do sistema com copy mais atrativa e orientada a venda.
- A composicao deve seguir a pegada da referencia sem replica literal.
- Login e cadastro devem compartilhar a mesma estrutura visual; no cadastro mudam principalmente os campos e a copy do formulario.

## Estrutura

- Layout split em duas colunas no desktop, com hero a esquerda ocupando mais espaco.
- Hero com headline forte, descricao curta, lista de beneficios e metricas de apoio.
- Formulario enxuto na direita com titulo, campos, CTA, feedback de erro e card auxiliar abaixo.
- No mobile, o hero vira um topo compacto acima do formulario.

## Direcao Visual

- Base dark com variacoes de fundo e linhas sutis para profundidade.
- Azul `primary` ja usado no projeto como cor de destaque visual.
- Tipografia grande no hero, alto contraste e espacamento mais ritmado.
- Logo oficial em destaque, substituindo iconografia generica.

## Conteudo

- Headline focada em crescimento com controle.
- Beneficios centrados em organizacao total, previsibilidade e profissionalizacao da rotina.
- Card auxiliar abaixo do CTA mantendo apoio ao acesso e cadastro sem promessas falsas ou credenciais demo inexistentes.

## Responsividade

- Desktop: hero dominante e formulario lateral.
- Tablet: hero reduzido, mantendo hierarquia e respiracao.
- Mobile: bloco de marca e resumo compacto antes do form; cards secundarios podem ser reduzidos.

## Implementacao

- Alinhar `app/(auth)/login/page.tsx` e `app/(auth)/register/page.tsx` com uma base visual compartilhada.
- Reaproveitar `Button`, `Input` e `Label` existentes.
- Usar `next/image` para o logo real.
- Manter comportamento de autenticacao e mensagens de erro atuais.

## Verificacao

- Validar lint do arquivo alterado.
- Validar build do projeto apos a mudanca.

## Observacao

- O usuario pediu explicitamente para aplicar sem criar commit. Portanto a implementacao nao deve gerar commit.
