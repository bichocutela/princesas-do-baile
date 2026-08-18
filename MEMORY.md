# Memória de Implementação — Princesas do Baile

O projeto é um jogo gratuito de navegador com React e Babylon.js. React administra somente o ciclo de vida do canvas e a moldura da página; os estados de quebra-cabeça, configurações das fases e regras de navegação ficam em módulos TypeScript em `client/src/game/`.

As 40 fases estão documentadas em `CAMPAIGN.md`. O primeiro núcleo jogável usa dioramas procedurais para as passarelas, nós, portais e controles, apoiado pelos ativos visuais externos listados em `ASSETS.md`. O progresso do primeiro lançamento é local (`localStorage`), não exige login e não depende de infraestrutura em tempo real.

Os ativos são carregados pelas URLs `/manus-storage/` registradas em `ASSETS.md`; não devem ser copiados para a árvore do projeto. A narrativa apresenta personagens adultas e não contém nudez, sexualização explícita, pornografia ou atos sexuais gráficos.

