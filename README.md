# 📚 Estante Virtual — Marketplace de Livros

Projeto de Frontend (P2) — aplicação web para catálogo e gerenciamento de livros, consumindo uma API REST publicada no Render.

## Objetivo

Criar uma interface web funcional, responsiva e com boa experiência de uso, que consuma os endpoints da API fornecida e permita ao usuário realizar operações de **CRUD completo** (Create, Read, Update, Delete) sobre um catálogo de livros, com autenticação de usuário e separação entre área pública (marketplace) e área administrativa.

## Tecnologias utilizadas

- **HTML5** — estrutura das páginas
- **CSS** — estilização, responsividade e tema visual
- **JavaScript (Vanilla)** — lógica da aplicação, manipulação do DOM, consumo da API e navegação entre páginas
- **Fetch API** — requisições HTTP (GET, POST, PUT, PATCH, DELETE)
- **LocalStorage** — armazenamento do token de autenticação (JWT)
- **API REST**: [`https://base-back-dwpz.onrender.com`](https://base-back-dwpz.onrender.com)

Não foram utilizados frameworks ou bibliotecas de frontend.

## Funcionalidades implementadas

### Autenticação
- Cadastro de novo usuário (`POST /cadastrar`)
- Login com geração e armazenamento de token JWT (`POST /entrar`)
- Logout (remove o token do `localStorage`)
- Tela de login exibida obrigatoriamente antes do acesso ao marketplace

### Marketplace (página pública — `index.html`)
- Listagem de livros cadastrados (`GET /produtos`)
- Busca por título em tempo real
- Filtro por gênero literário (`GET /categorias`)
- Tela de detalhes do livro (capa, sinopse, avaliação, ano, páginas, destaque)
- Tela de **leitura** com trecho ficcional gerado dinamicamente
- Tela de **anúncio** promocional do livro
- Navegação para a área administrativa via JavaScript

## Área administrativa (página protegida — `admin.html`)
- Acesso bloqueado para usuários não autenticados
- Cadastro de novos livros (`POST /produtos`)
- Edição completa de livros (`PUT /produtos/:id`)
- Atualização parcial — alternar destaque (`PATCH /produtos/:id`)
- Exclusão de livros (`DELETE /produtos/:id`)
- Busca e filtro por gênero
- Após o cadastro, o livro aparece automaticamente no marketplace

### Geral
- Tratamento de erros de requisição com mensagens de feedback (toasts)
- Layout responsivo (desktop, tablet e mobile)
- Manipulação do DOM para renderização dinâmica dos cards de livros e modais

## Como executar localmente

1. Clone este repositório:

 <link-do-repositorio>

2. Entre na pasta do projeto:

   cd estante-virtual

3. Abra o arquivo `index.html` no navegador (recomenda-se usar a extensão **Live Server** do VS Code para evitar problemas de CORS/caminhos relativos).
4. Crie uma conta na tela de cadastro e faça login para acessar o marketplace e a área administrativa.

## Links

- **GitHub Pages**: `<link do deploy aqui>`
- **Vídeo pitch**: `<https://youtu.be/qXZAJQ9AqNA>`
- **Publicação no LinkedIn**: `<link da publicação aqui>`

## Estrutura básica do projeto

```
estante-virtual/
├── index.html        # Página do marketplace (público + login)
├── admin.html        # Página da área administrativa (protegida)
├── api.js            # Funções de consumo da API (GET, POST, PUT, PATCH, DELETE)
├── marketplace.js    # Lógica da página do marketplace
├── admin.js          # Lógica da área administrativa (CRUD)
├── style.css         # Estilos e responsividade
└── README.md
```

## Decisões técnicas relevantes

- **Separação em duas páginas** (`index.html` e `admin.html`), com navegação feita via JavaScript (`window.location.href`), para distinguir claramente a experiência do usuário comum (marketplace) da área de gerenciamento (admin).
- **Proteção da rota administrativa**: o `admin.js` verifica a existência do token no `localStorage` ao carregar a página; sem token, exibe uma tela de acesso restrito.
- **Uso diferenciado de PUT e PATCH**: o formulário de edição completa utiliza `PUT` (substitui todos os dados do livro), enquanto o botão de "destaque" no card utiliza `PATCH` (atualização parcial de um único campo).
- **Filtragem de categorias**: como a API é compartilhada entre várias equipes/temas, as categorias retornadas são filtradas no frontend para exibir apenas gêneros literários, evitando categorias de outros domínios (ex.: eletrônicos).
- **Tema visual personalizado** ("Estante Virtual"), com paleta inspirada em bibliotecas, tipografia serifada para títulos e ícones temáticos para reforçar a identidade do projeto.
- **Feedback visual constante** (toasts, estados de carregamento, botões desabilitados durante requisições) para melhorar a experiência do usuário e deixar claro o status das operações com a API.

## Autor

-Isabelle Caroline de Moraes Lourenço
