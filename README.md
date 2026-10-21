# Prumo — pacote para GitHub Pages

Este pacote inclui o código-fonte do painel e a versão de produção pronta em `docs/`. Para evitar problemas com arquivos ocultos do GitHub Actions, publique a pasta `docs` diretamente pelo GitHub Pages.

## Publicar no repositório

1. Extraia o ZIP. Envie o conteúdo do nível principal do pacote para a raiz do repositório `painelPrumo`, preservando a pasta `docs` e seus arquivos. A raiz deve conter `docs/index.html` e `docs/assets/`.
2. Faça o commit dessas alterações diretamente na branch `main`.
3. No GitHub, abra **Settings → Pages → Build and deployment**. Em **Source**, selecione **Deploy from a branch**. Em **Branch**, escolha `main`; no seletor de pasta, escolha `/docs`; clique em **Save**.
4. Na aba **Actions**, aguarde a execução padrão **pages build and deployment** terminar com sucesso. Depois, abra https://rdgptn.github.io/painelPrumo/.

Nesta configuração, o GitHub publica os arquivos compilados que já estão em `docs/`; não é preciso criar `.github/workflows/deploy.yml` nem selecionar **GitHub Actions** como origem.

## Atualizações futuras

Para recompilar após alterar o código-fonte, use Node.js 22 e pnpm 11, execute `pnpm install --frozen-lockfile` e `pnpm build`. Depois, substitua o conteúdo de `docs/` pelo conteúdo de `dist/`, faça commit e envie para `main`.
