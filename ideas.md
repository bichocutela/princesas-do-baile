# Direção de Design — Princesas do Baile

## Três abordagens iniciais

### 1. Palácios de Papel
**Muito Breve Intro:** Torres de marfim, escadas cor-de-rosa e pátios azul-petróleo flutuam sobre um fundo quente. A experiência parece uma maquete arquitetônica delicada que muda de regra quando o ponto de vista muda.

**Probabilidade:** 0,12

### 2. Jardim de Espelhos
**Muito Breve Intro:** Um labirinto de espelhos, água e estátuas desenha reflexos que escondem e revelam caminhos. O tom é contemplativo, com puzzle baseado em simetria e luz.

**Probabilidade:** 0,08

### 3. Baile Suspenso
**Muito Breve Intro:** Salões, sacadas e plataformas de um palácio impossível flutuam em um céu de fim de tarde. A arquitetura vira coreografia: caminhos se encaixam, giram e se dobram para que as convidadas adultas alcancem o baile final.

**Probabilidade:** 0,16

## Abordagem escolhida: Baile Suspenso

### Movimento de design

**Quebra-cabeça arquitetônico de ilusão ótica, em dioramas isométricos minimalistas.** Cada fase é um monumento compacto e navegável, formado por passarelas, torres, arcos e plataformas que parecem desconectados até que a câmera gira. A sensação vem da descoberta espacial e de um ritmo calmo, nunca de cópia visual ou mecânica de jogos específicos.

### Princípios centrais

1. **A perspectiva é uma ferramenta:** girar o diorama é uma ação central, não apenas uma câmera; rotas distantes tornam-se contínuas quando vistas no ângulo correto.
2. **Uma regra nova por bloco:** a campanha introduz gradualmente rotação, alavancas, pontes dobráveis, sombras sólidas e portais de espelho, sem sobrecarregar a pessoa jogadora.
3. **Beleza legível:** volumes grandes, poucas cores por fase, bordas claras e sombras suaves ajudam cada caminho a ser entendido antes de ser resolvido.
4. **Narrativa gentil:** a história de uma anfitriã adulta guiando convidadas para um baile perdido aparece em bilhetes breves, não interrompe o puzzle e não contém sexualização explícita.

### Filosofia de cor

O mundo é uma coleção de lembranças de festa. **Creme de porcelana** é a matéria dos monumentos; **coral de pôr do sol** dá calor às metas e pontes móveis; **azul laguna** estabelece profundidade e silêncio; **ameixa escura** sugere mistério nas áreas inacessíveis; **dourado suave** marca elementos interativos. A cor proprietária é o **Coral de Convite — #E56B63**, usado para a personagem, botões de ação e objetivos finais.

### Paradigma de layout

A tela prioriza um **diorama central em 3D**, flutuando sobre uma paisagem de céu ou mar abstrato. A interface é mínima: no canto superior esquerdo há o nome da fase e a contagem de passos; no superior direito, reinício e som; na parte inferior, três controles arredondados de interação — girar à esquerda, avançar e girar à direita. Em mobile, controles grandes ocupam a faixa inferior e o texto narrativo aparece como uma pequena etiqueta flutuante acima deles.

### Elementos de assinatura

1. **Passarelas de fita:** caminhos coral que dobram em ângulos que só fazem sentido após a rotação.
2. **Portais de espelho:** arcos dourados que conectam faces opostas de um diorama ao alinhar um reflexo.
3. **Convidados de papel:** pequenas figuras geométricas com capa, a partir das quais a narrativa é sugerida sem exigir retratos detalhados.

### Filosofia de interação

O toque ou clique deve convidar à experimentação. Girar o cenário executa uma transição clara de 350 ms; tocar um nó dourado aciona uma ponte, alavanca ou portal; tocar uma passarela válida move a personagem uma casa. Não há limite de tentativas, cronômetro punitivo ou compras: o jogo é gratuito e contemplativo. Teclado: setas rotacionam e percorrem a rota; `R` reinicia a fase.

### Animação

O diorama usa rotação com desaceleração elegante, pequenas elevações de ponte e partículas de convite douradas ao concluir um objetivo. Todas as transições ficam abaixo de 450 ms, usam uma curva de desaceleração firme e respeitam `prefers-reduced-motion`. A personagem desliza entre nós em vez de caminhar com uma animação complexa; isso preserva precisão de puzzle e clareza visual.

### Sistema tipográfico

**DM Serif Display** dá voz a títulos e nomes de fase, em peso regular e formas serenas. **Manrope** torna instruções e números claros em todos os tamanhos. Os títulos surgem em frase, enquanto micro-rótulos são pequenos, espaçados e em caixa alta.

### Essência de marca

**Princesas do Baile é um jogo gratuito de arquitetura impossível no qual cada giro de perspectiva aproxima as convidadas de uma celebração perdida.** Personalidade: **serena, engenhosa, luminosa**.

### Voz da marca

A microcopy é acolhedora e curiosa. Ela sugere uma descoberta, em vez de ordenar uma solução.

> “Quando o arco encontra a sombra, a passagem aparece.”

> “O baile ainda espera — basta olhar por outro ângulo.”

### Wordmark e logo

O wordmark coloca “PRINCESAS” sobre “DO BAILE”, com uma serif elegante e espaçada. O símbolo é uma **escadaria em espiral dentro de um arco de convite**, simplificada em três degraus impossíveis e uma lua circular. O ícone deve funcionar sem texto em botões e marcadores de fase.

### Cor de assinatura

**Coral de Convite — #E56B63.**
