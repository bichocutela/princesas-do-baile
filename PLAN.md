# Plano de desenvolvimento — Princesas do Baile

## Escopo atual

**Princesas do Baile** é um jogo gratuito de quebra-cabeças e ilusão ótica. Lina atravessa **170 monumentos isométricos** agrupados em **17 módulos-capítulos**, cada um com dez fases. A campanha é original, não reproduz arte, mapas, interface, personagens ou narrativa de obras existentes e mantém conteúdo não explícito.

A curva de dificuldade é enigmática. Os primeiros módulos ensinam a leitura de perspectiva por repetição visual; os módulos intermediários introduzem alavancas, pontes, portais e luz; os módulos finais combinam esses sistemas com símbolos recorrentes, pistas incompletas e soluções que precisam ser observadas antes de serem executadas.

## Estrutura narrativa

O companheiro de Lina se chama **Íris**. Ele aparece no módulo 9, acompanha Lina pelos módulos 9 a 12 e desaparece durante o módulo 13. Os módulos 13 a 17 transformam a ausência em parte do enigma: marcas deixadas por Íris funcionam como pistas ambientais, mas nunca como instruções diretas.

| Faixa | Módulos | Função de design |
|---|---:|---|
| Abertura | 1–3 | Perspectiva, rotação e leitura de símbolos. |
| Aprendizado | 4–7 | Alavancas, pontes e sequências de escolha. |
| Encontro | 8–10 | Portais de espelho e entrada de Íris. |
| Perda | 11–14 | Luz, sombras sólidas e desaparecimento de Íris. |
| Desfecho | 15–17 | Combinação de todas as regras e pistas de memória. |

## Arquitetura técnica

O catálogo executável está em `client/src/game/levels.ts` e gera 170 configurações a partir dos 17 módulos em `client/src/game/modules.ts`. O progresso local usa `localStorage` e aceita IDs de 1 a 170. O motor valida conectividade por rotação, alavanca, luz e portal; um portal transfere Lina para o nó de saída correspondente, enquanto uma sombra só abre quando a lanterna está acesa.

A interface desktop e mobile usa um direcional virtual de quatro direções. Esquerda e direita giram o monumento, cima segue a primeira passagem disponível e baixo reinicia a fase. As mesmas ações estão disponíveis pelas setas e pelas teclas `WASD`.

## Android e GitHub

O projeto web é empacotado por Capacitor no aplicativo nativo Android com o identificador `com.princesasdobaile.app`. O workflow `.github/workflows/android-apk.yml` executa build web, sincronização Capacitor, compilação Gradle e publicação do APK como artefato. Tags `v*` também criam uma GitHub Release com o APK anexado. Não há dependência da Play Store.

## Verificações

- `pnpm check` deve concluir sem erros de TypeScript.
- `pnpm test` cobre catálogo de 170 fases, módulos, progressão, arco de Íris e solução de mecânicas avançadas.
- `pnpm mobile:sync` deve produzir o bundle web e sincronizar `android/`.
- O workflow do GitHub Actions deve concluir `Build debug APK` e anexar `app-debug.apk` em uma Release versionada.
- O modo `?demo` permanece disponível para QA visual, incluindo `?demo&level=145` para uma fase avançada de combinação.
