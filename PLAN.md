# Game Plan: Princesas do Baile

## Main Build

**Princesas do Baile** é um jogo gratuito de quebra-cabeças e ilusão ótica para navegador. A pessoa jogadora guia Lina, uma anfitriã adulta, por 40 monumentos isométricos de arquitetura impossível. Cada fase combina pequenas cenas narrativas, rotação de perspectiva, passarelas móveis, portais de espelho e sombras sólidas. A campanha é original e não replica a arte, os mapas, a interface, a narrativa ou os sistemas de nenhuma obra existente.

O lançamento jogável apresenta uma tela de seleção composta por 40 convites e progresso local gratuito. As quarenta fases são configurações de diorama distintas: cada uma altera a disposição dos nós, alturas, vistas e sequência de passarelas. Elas introduzem e combinam as regras descritas em `CAMPAIGN.md`, sem reescrever a lógica de rotação, navegação ou conclusão.

- **Assets:**
  - `princesas-optical-reference` — `/manus-storage/princesas-optical-reference_e3d0b3e5.png` — referência de QA da composição.
  - `princesas-optical-stage` — `/manus-storage/princesas-optical-stage_bae2c755.png` — fundo de abertura e ambientação.
  - `princesas-hostess` — `/manus-storage/princesas-hostess_bae940c0.png` — imagem de protagonista na abertura e UI.
  - `princesas-optical-logo` — `/manus-storage/princesas-optical-logo_714ccbeb.png` — marca da tela de título.
- **Verify:**
  - Girar para esquerda e direita produz ângulos determinísticos e evidencia mudanças de conectividade entre passarelas.
  - Tocar ou clicar em uma passarela válida move Lina para o nó escolhido; passarelas não conectadas não permitem movimento.
  - Ativar uma alavanca muda a geometria da ponte e atualiza a rota disponível sem reiniciar a fase.
  - O botão e a tecla `R` reiniciam a fase e restauram o estado inicial.
  - A conclusão atualiza a tela de seleção e persiste localmente sem exigir login, pagamento ou rede.
  - A interface permanece legível em desktop e mobile, sem sobreposição ou corte.
  - Não há erros de console durante uma fase completa e as imagens carregam pelas URLs de armazenamento.
  - O modo `?demo` executa uma solução determinística de demonstração para validação visual.
