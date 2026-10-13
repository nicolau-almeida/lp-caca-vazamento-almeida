# Caça Vazamento Almeida

Landing page estática em HTML, CSS e JavaScript puro. Sem dependências e sem etapa de build.

## Estrutura

```
.
├── index.html   # Página principal
├── styles.css   # Estilos
├── script.js    # Scripts
└── assets/      # Imagens e outros arquivos estáticos
```

## Abrir localmente

**Opção 1: direto no navegador**

Dê dois cliques em `index.html`, ou pelo terminal:

```bash
start index.html      # Windows
open index.html       # macOS
xdg-open index.html   # Linux
```

**Opção 2: servidor local**

Recomendado, pois reproduz o comportamento de produção (caminhos, cache, requisições `fetch`). Use qualquer um dos comandos abaixo na raiz do projeto:

```bash
npx serve .                  # requer Node.js, abre em http://localhost:3000
python -m http.server 8000   # requer Python, abre em http://localhost:8000
```

No VS Code, a extensão **Live Server** também funciona: clique com o botão direito em `index.html` e escolha "Open with Live Server".

## Publicar na Vercel

**Opção 1: pelo painel (com GitHub)**

1. Crie um repositório no GitHub e envie o código:

   ```bash
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```

2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. Em **Framework Preset**, selecione **Other**. Deixe **Build Command** e **Output Directory** vazios e mantenha o **Root Directory** como `./`.
4. Clique em **Deploy**.

A partir daí, cada `git push` na branch `main` gera um deploy de produção, e cada push em outras branches gera um deploy de preview.

**Opção 2: pela CLI**

```bash
npx vercel          # deploy de preview (na primeira vez, faz login e vincula o projeto)
npx vercel --prod   # deploy de produção
```

Nas perguntas da CLI, aceite os padrões: o diretório do código é `./` e não há comando de build.
