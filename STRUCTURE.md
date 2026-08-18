# Estrutura Técnica — Princesas do Baile

## Visão geral

O jogo usa React como moldura de ciclo de vida e Babylon.js como canvas de diorama 3D. O motor de quebra-cabeças permanece independente de React em `client/src/game/`. O lançamento é gratuito e funciona sem login: o estado de campanhas, fase desbloqueada, coleções e preferências é gravado em `localStorage`.

```text
GameCanvas (React: ciclo de vida do engine)
└── createGameScene (Babylon: cena e UI de jogo)
    ├── PuzzleWorld (diorama, câmera, rotação e entidades visuais)
    ├── PuzzleSession (estado de uma fase e regras de movimento)
    ├── LevelCatalog (40 configurações de fase e textos)
    ├── LocalProgress (salvamento e desbloqueio local)
    └── GameHud (DOM: título, progresso, controles e modais)
```

## Módulos

| Arquivo | Responsabilidade | Dependências principais |
|---|---|---|
| `client/src/components/GameCanvas.tsx` | Inicializa e descarta o engine uma vez, adapta ao tamanho da tela. | `Engine`, `game/scene` |
| `client/src/game/scene.ts` | Cria a cena, a câmera, luzes, fundo e o ciclo principal. | `PuzzleWorld`, `GameHud` |
| `client/src/game/levels.ts` | Define os 40 níveis com mapa, regras, meta e texto de fase. | Tipos de nível |
| `client/src/game/PuzzleSession.ts` | Mantém fase atual, posição, rotação, pontes e estados de conclusão. | `levels`, `LocalProgress` |
| `client/src/game/PuzzleWorld.ts` | Constrói pedestais, nós, passarelas, portais, personagem e feedback visual. | Babylon meshes, `PuzzleSession` |
| `client/src/game/GameHud.ts` | Conecta controles de tela e teclado a eventos sem colocar lógica de puzzle no React. | `PuzzleSession` |
| `client/src/game/progress.ts` | Lê, normaliza e persiste avanço local. | `localStorage` |
| `client/src/game/types.ts` | Tipos de fase, nó, caminho e progresso. | Nenhuma |

## Modelo de fase

Cada fase é um grafo explícito. Um nó tem posição 3D e pode ser início, meta, alavanca ou ponto de passagem. Uma aresta declara em quais dos quatro ângulos de rotação ela se torna conectável. O motor não permite atravessar uma rota enquanto sua `visibleAt` não incluir o ângulo atual. Assim, girar o monumento não é somente visual: ele abre e fecha as conexões permitidas.

```ts
type PuzzleLevel = {
  id: number;
  act: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  nodes: PuzzleNode[];
  paths: PuzzlePath[];
  switches?: PuzzleSwitch[];
  startNodeId: string;
  goalNodeId: string;
};
```

Os níveis 1–8 exploram rotação; 9–16 incluem pontes ativadas; 17–24 introduzem portais como conexões não locais; 25–32 adicionam caminhos que dependem de uma condição de luz; e 33–40 combinam regras. A implementação compartilha o mesmo motor e configurações distintas por fase, evitando uma lógica paralela por capítulo.

## Entrada e estados

| Ação | Controle | Efeito |
|---|---|---|
| Girar à esquerda | Botão, `←` ou `A` | Atualiza ângulo para o estado anterior e redesenha as passarelas permitidas. |
| Girar à direita | Botão, `→` ou `D` | Atualiza ângulo para o próximo estado e redesenha as passarelas permitidas. |
| Avançar | Clique/toque em nó adjacente ou `Enter` | Move Lina pela rota que esteja válida. |
| Ativar elemento | Clique/toque no nó de alavanca | Altera o estado de uma ponte ou portal da fase. |
| Reiniciar | Botão ou `R` | Retorna ao nó inicial e restaura as condições da fase. |

## Salvamento local

O objeto `princesas-do-baile:progress:v1` contém `highestUnlocked`, `completedLevelIds`, `collectedInvitationIds`, `soundEnabled` e `lastPlayedLevelId`. O carregamento valida os limites antes de usar os dados; em caso de armazenamento inválido ou ausente, cria um progresso novo, iniciando na fase 1. O motor salva somente após concluir uma fase ou alterar uma preferência.

## Ativos

Os ativos ilustrativos ficam em URLs de armazenamento indicadas em `ASSETS.md`. A geometria de puzzle — torres, escadas, nós, arcos, pontes e elementos de interface — será formada por meshes simples, materiais foscos e luzes de cena; não há modelos importados nem imagens locais no repositório.

## Verificação planejada

O jogo terá um modo `?demo` que carrega a fase 1 e executa uma sequência previsível de rotações e movimentos. A validação visual confirma que o diorama aparece, que as passarelas mudam ao girar e que a personagem alcança a meta. Testes de unidade cobrem a normalização de progresso, o desbloqueio consecutivo e as regras de conectividade por ângulo.
