# Prumo

Painel pessoal para registrar receitas e despesas e acompanhar o saldo ao longo do tempo. Feito com React, TypeScript e Vite, com interface em português e layout adaptável a desktop e celular.

## Recursos

- Cadastro e remoção de receitas e despesas por categoria, valor e data.
- Resumo financeiro por período, com saldo, receitas, despesas e quantidade de lançamentos.
- Gráficos de entradas, saídas e despesas por categoria.
- Busca de lançamentos e exportação da lista filtrada em CSV.

## Dados

O projeto não usa backend, contas ou banco de dados. Os lançamentos ficam no `localStorage` do navegador em que foram criados e não são sincronizados com outros dispositivos. Se os dados do site forem apagados no navegador, os lançamentos também serão removidos.

Na primeira abertura, o painel mostra registros de exemplo para preencher os gráficos. Eles não representam movimentações reais e podem ser removidos pela lista.

## Rodar localmente

Requisitos: Node.js 22 ou superior e pnpm 11.

```bash
pnpm install
pnpm dev
```

Para gerar os arquivos estáticos de produção:

```bash
pnpm build
```

O resultado é criado em `dist/`. A configuração de caminhos relativos também permite hospedar o site em um subdiretório, como `https://usuario.github.io/nome-do-repositorio/`.

## Publicar no GitHub Pages

O GitHub Pages não executa arquivos `.tsx` diretamente. O repositório inclui um workflow em `.github/workflows/deploy.yml` que instala as dependências, executa o build e publica a pasta `dist/` sempre que há um push para `main`.

Depois de enviar os arquivos ao repositório:

1. No GitHub, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions** (não “Deploy from a branch”).
3. Envie um commit para a branch `main` e aguarde a conclusão do workflow na aba **Actions**.

A página só será atualizada depois que o workflow terminar com sucesso. Se o repositório usa outra branch principal, ajuste `main` no arquivo `.github/workflows/deploy.yml`.
