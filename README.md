# Prumo

Painel simples para registrar receitas e despesas e acompanhar o saldo ao longo do tempo. O projeto foi feito com React, TypeScript e Vite, com interface em português e layout adaptável a desktop e celular.

## O que dá para fazer

- Registrar receitas e despesas com descrição, categoria, valor e data.
- Consultar saldo, receitas, despesas e quantidade de lançamentos por período.
- Comparar entradas e saídas em um gráfico e ver a distribuição das despesas por categoria.
- Buscar lançamentos e exportar a lista filtrada em CSV.

## Dados e privacidade

Não há backend, conta de usuário ou banco de dados. Os lançamentos ficam no `localStorage` do navegador usado. Eles não são sincronizados com outros dispositivos; se os dados do site forem apagados no navegador, os lançamentos também serão removidos.

Na primeira abertura aparecem registros de exemplo para preencher os gráficos. Eles não representam movimentações reais e podem ser removidos na lista.

## Rodar localmente

Requisitos: Node.js 22 ou superior e pnpm 11.

```bash
pnpm install
pnpm dev
```

Abra o endereço indicado pelo Vite no terminal. Para gerar os arquivos estáticos:

```bash
pnpm build
```

O resultado fica na pasta `dist/`. O caminho relativo dos arquivos gerados permite hospedar o site na raiz ou em um subdiretório, como no GitHub Pages.

## Publicar em um repositório GitHub

Extraia o ZIP em uma pasta, crie um repositório vazio no GitHub e, dentro da pasta extraída, execute:

```bash
git init
git add .
git commit -m "Adiciona painel Prumo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Para hospedar o site pelo GitHub Pages, configure o projeto para instalar as dependências, executar `pnpm build` e publicar o conteúdo de `dist/`.
