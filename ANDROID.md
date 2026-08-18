# Android e distribuição pelo GitHub

**Princesas do Baile** usa Capacitor para empacotar o jogo web como um aplicativo Android nativo. A distribuição prevista é exclusivamente pelo GitHub; não há dependência da Play Store.

## Gerar localmente

Depois de instalar Java e o Android SDK, execute `pnpm android:debug`. O APK de desenvolvimento será criado em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Gerar pelo GitHub

O workflow `.github/workflows/android-apk.yml` pode ser executado manualmente pela aba **Actions** ou acionado ao criar uma tag no formato `v1.0.0`. A execução publica o APK como artefato; em tags, também o anexa automaticamente a uma GitHub Release.

## Instalar no Android

Baixe `app-debug.apk` na execução do workflow ou na Release, transfira-o para o celular e abra o arquivo. O Android pode solicitar a permissão para instalar aplicativos dessa fonte. Essa permissão é controlada pelo próprio sistema e pode ser desativada depois da instalação.

O APK atual é uma versão de desenvolvimento para distribuição direta. Antes de distribuir uma versão pública, o projeto deve receber uma chave de assinatura de produção guardada como segredo do GitHub Actions.

## Continuidade

O catálogo da campanha está estruturado em 170 fases e 17 módulos. A evolução futura pode adicionar trilha sonora, novos símbolos, variações de diorama e sincronização opcional de progresso sem alterar o fluxo de instalação.
