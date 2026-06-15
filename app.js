'use strict'

let produtos = [];
let editandoId = null;
let livroAtualDetalhe = null;

const GENEROS_LIVROS = [
  'Romance', 'Ficção Científica', 'Terror', 'Fantasia',
  'Biografia', 'Aventura', 'Clássico', 'Suspense',
  'Autoajuda', 'Poesia', 'HQ / Mangá', 'Infantil',
  'Policial', 'Histórico', 'Filosofia', 'Conto'
];

const LIVROS_INICIAIS = [
  { nome: 'O Último Manuscrito', descricao: 'Elena Voss — Uma arqueóloga descobre um pergaminho que pode reescrever a história da humanidade.', preco: 4.7, precoAntigo: 2021, estoque: 312, imagemUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', emDestaque: true },
  { nome: 'Sombras de Atreia', descricao: 'Marco Silveira — Em um reino de névoa eterna, um jovem guerreiro busca a lenda do fogo esquecido.', preco: 4.5, precoAntigo: 2019, estoque: 428, imagemUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', emDestaque: false },
  { nome: 'Café com Fantasmas', descricao: 'Lúcia Drummond — Uma cafeteria no Rio de Janeiro esconde segredos de vidas passadas entre suas mesas.', preco: 4.2, precoAntigo: 2022, estoque: 198, imagemUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', emDestaque: false },
  { nome: 'A Equação do Fim', descricao: 'Dr. Paulo Neves — Um matemático descobre que o universo está sendo deletado linha por linha.', preco: 4.8, precoAntigo: 2023, estoque: 389, imagemUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=400&fit=crop', emDestaque: true },
  { nome: 'Cartas para Ninguém', descricao: 'Ana Flores — Correspondências encontradas num sótão revelam um romance proibido dos anos 40.', preco: 4.1, precoAntigo: 2020, estoque: 256, imagemUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop', emDestaque: false },
  { nome: 'Neon e Pólvora', descricao: 'Diego Ramos — Cyberpunk brasileiro: detetive aumentado investiga crimes em São Paulo 2087.', preco: 4.6, precoAntigo: 2023, estoque: 334, imagemUrl: 'https://images.unsplash.com/photo-1531901599143-df5010ab9438?w=300&h=400&fit=crop', emDestaque: false },
];

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) fecharModal();
  });
  document.getElementById('detalhe-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('detalhe-overlay')) fecharDetalhe();
  });
  document.getElementById('leitura-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('leitura-overlay')) fecharLeitura();
  });
  document.getElementById('anuncio-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('anuncio-overlay')) fecharAnuncio();
  });

  // Sempre mostra login primeiro
  mostrarAba('login');
  document.getElementById('tela-auth').style.display = 'flex';
  document.getElementById('tela-app').style.display  = 'none';

  // Se já tinha token, redireciona após um tick (DOM pronto)
  const token = localStorage.getItem('token');
  if (token) entrarNoApp();
});


function mostrarAba(aba) {
  document.getElementById('form-login').style.display    = aba === 'login'    ? 'flex' : 'none';
  document.getElementById('form-cadastro').style.display = aba === 'cadastro' ? 'flex' : 'none';
  document.getElementById('aba-login').classList.toggle('aba--ativa',    aba === 'login');
  document.getElementById('aba-cadastro').classList.toggle('aba--ativa', aba === 'cadastro');
  document.getElementById('erro-login').textContent    = '';
  document.getElementById('erro-cadastro').textContent = '';
}

async function handleCadastro(event) {
  event.preventDefault();
  const nome   = document.getElementById('cad-nome').value.trim();
  const email  = document.getElementById('cad-email').value.trim();
  const senha  = document.getElementById('cad-senha').value;
  const erroEl = document.getElementById('erro-cadastro');
  const btn    = event.target.querySelector('button[type="submit"]');
  erroEl.textContent = '';

  setBtnLoading(btn, true, 'Criando conta...');
  try {
    await apiCadastrar(nome, email, senha);
    mostrarToast('Conta criada! Faça login.');
    mostrarAba('login');
    document.getElementById('login-email').value = email;
  } catch (e) {
    erroEl.textContent = e.message;
  } finally {
    setBtnLoading(btn, false, 'Criar conta');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email  = document.getElementById('login-email').value.trim();
  const senha  = document.getElementById('login-senha').value;
  const erroEl = document.getElementById('erro-login');
  const btn    = event.target.querySelector('button[type="submit"]');
  erroEl.textContent = '';

  setBtnLoading(btn, true, 'Entrando...');
  try {
    const data = await apiEntrar(email, senha);
    const token = data.accessToken || data.token || data.access_token;
    if (!token) throw new Error('Token não retornado pela API');
    localStorage.setItem('token', token);
    localStorage.setItem('usuario_email', email);
    entrarNoApp();
  } catch (e) {
    erroEl.textContent = e.message;
  } finally {
    setBtnLoading(btn, false, 'Entrar');
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario_email');
  document.getElementById('tela-app').style.display  = 'none';
  document.getElementById('tela-auth').style.display = 'flex';
  mostrarAba('login');
  produtos = [];
}

async function entrarNoApp() {
  document.getElementById('tela-auth').style.display = 'none';
  document.getElementById('tela-app').style.display  = 'block';
  document.getElementById('header-usuario').textContent =
    localStorage.getItem('usuario_email') || '';
  await carregarCategorias();
  await carregarProdutos();
  // Se estante vazia, popula com livros imaginários
  if (produtos.length === 0) await popularEstante();
}


async function popularEstante() {
  mostrarToast('📚 Populando sua estante com livros...');
  for (const livro of LIVROS_INICIAIS) {
    try { await apiCriarProduto({ ...livro, ativo: true }); } catch(_) {}
  }
  await carregarProdutos();
  mostrarToast('✅ Estante populada com livros imaginários!');
}


async function carregarProdutos() {
  const grid  = document.getElementById('livros-grid');
  const vazio = document.getElementById('estado-vazio');

  vazio.textContent = '⏳ Carregando livros...';
  vazio.style.display = 'block';
  grid.querySelectorAll('.card').forEach(c => c.remove());

  try {
    produtos = await apiListarProdutos();
    renderizarProdutos(produtos);
  } catch (e) {
    vazio.textContent = '❌ Erro ao carregar. Tente novamente.';
    mostrarToast(e.message, 'erro');
  }
}

function renderizarProdutos(lista) {
  const grid  = document.getElementById('livros-grid');
  const vazio = document.getElementById('estado-vazio');

  grid.querySelectorAll('.card').forEach(c => c.remove());

  if (!lista || lista.length === 0) {
    vazio.textContent = 'Nenhum livro cadastrado ainda. Adicione o primeiro!';
    vazio.style.display = 'block';
    return;
  }
  vazio.style.display = 'none';

  lista.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card' + (p.emDestaque ? ' card--destaque' : '');
    card.dataset.id = p.id;

    const nomeCategoria = p.categoria?.nome || '';
    const avaliacao     = p.preco    != null ? `⭐ ${Number(p.preco).toFixed(1)}` : '';
    const ano           = p.precoAntigo      ? `📅 ${p.precoAntigo}`              : '';
    const paginas       = p.estoque          ? `📄 ${p.estoque} págs.`            : '';

    const capa = p.imagemUrl
      ? `<img class="card__capa" src="${esc(p.imagemUrl)}" alt="Capa de ${esc(p.nome)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
         <div class="card__sem-capa" style="display:none">📖</div>`
      : `<div class="card__sem-capa">📖</div>`;

    card.innerHTML = `
      ${capa}
      ${nomeCategoria ? `<span class="card__categoria">${esc(nomeCategoria)}</span>` : ''}
      <h2 class="card__nome">${esc(p.nome)}</h2>
      ${p.descricao ? `<p class="card__descricao">${esc(p.descricao)}</p>` : ''}
      <div class="card__stats">
        ${avaliacao ? `<span>${avaliacao}</span>` : ''}
        ${ano       ? `<span>${ano}</span>`       : ''}
        ${paginas   ? `<span>${paginas}</span>`   : ''}
      </div>
      <div class="card__acoes">
        <button class="btn btn--secundario" onclick="event.stopPropagation();abrirModalEditar(${p.id})">✏️</button>
        <button class="btn btn--perigo"     onclick="event.stopPropagation();handleDeletar(${p.id},'${esc(p.nome)}')">🗑️</button>
      </div>
    `;

    card.addEventListener('click', e => {
      if (!e.target.closest('button')) abrirDetalhe(p.id);
    });

    grid.appendChild(card);
  });
}

function filtrarCards(texto) {
  const termo = texto.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const nome = card.querySelector('.card__nome')?.textContent.toLowerCase() || '';
    card.style.display = nome.includes(termo) ? '' : 'none';
  });
}


function abrirDetalhe(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  livroAtualDetalhe = p;

  const capa    = document.getElementById('detalhe-capa');
  const semCapa = document.getElementById('detalhe-sem-capa');

  if (p.imagemUrl) {
    capa.src = p.imagemUrl;
    capa.alt = p.nome;
    capa.style.display = 'block';
    semCapa.style.display = 'none';
    capa.onerror = () => { capa.style.display = 'none'; semCapa.style.display = 'flex'; };
  } else {
    capa.style.display = 'none';
    semCapa.style.display = 'flex';
  }

  document.getElementById('detalhe-categoria').textContent = p.categoria?.nome || '';
  document.getElementById('detalhe-nome').textContent      = p.nome || '';
  document.getElementById('detalhe-descricao').textContent = p.descricao || '';

  const meta = [];
  if (p.preco    != null) meta.push(`⭐ ${Number(p.preco).toFixed(1)}`);
  if (p.precoAntigo)      meta.push(`📅 ${p.precoAntigo}`);
  if (p.estoque)          meta.push(`📄 ${p.estoque} págs.`);
  if (p.emDestaque)       meta.push(`🌟 Destaque`);
  document.getElementById('detalhe-meta').innerHTML = meta.map(m => `<span>${m}</span>`).join('');

  document.getElementById('detalhe-btn-editar').onclick  = () => { fecharDetalhe(); abrirModalEditar(id); };
  document.getElementById('detalhe-btn-deletar').onclick = () => { fecharDetalhe(); handleDeletar(id, p.nome); };
  document.getElementById('detalhe-btn-ler').onclick     = () => { fecharDetalhe(); abrirLeitura(p); };
  document.getElementById('detalhe-btn-anuncio').onclick = () => { fecharDetalhe(); abrirAnuncio(p); };

  document.getElementById('detalhe-overlay').style.display = 'flex';
}

function fecharDetalhe() {
  document.getElementById('detalhe-overlay').style.display = 'none';
}


const TRECHOS = [
  (nome, autor) => `<p>A lua cobria o horizonte quando <em>${nome}</em> começou sua última jornada. As páginas que se seguem guardam um segredo que poucos ousaram desvendar.</p><p>— Você realmente acredita nisso? — ela perguntou, os olhos brilhando na penumbra da biblioteca.</p><p>— Acredito em tudo que pode ser provado — respondeu ele, abrindo o manuscrito com mãos trêmulas.</p><p>O vento bateu na janela como se o próprio tempo tentasse entrar...</p>`,
  (nome) => `<p>Capítulo I — <strong>O Começo do Fim</strong></p><p>Ninguém esperava que aquela manhã cinzenta de terça-feira mudaria tudo. <em>${nome}</em> acordou com a sensação estranha de que algo havia se deslocado no universo.</p><p>A cidade lá fora seguia seu ritmo mecânico, alheia ao fato de que em um pequeno apartamento do terceiro andar, a história do mundo estava prestes a ser reescrita.</p>`,
  (nome) => `<p>— Isso não é possível — murmurou o personagem, folheando as páginas de <em>${nome}</em> pela décima vez.</p><p>Mas era. Cada linha confirmava o que ele sempre suspeitou: a verdade não era um lugar fixo — era uma direção.</p><p>Lá fora, a chuva desenhava padrões nas janelas sujas do trem que cortava a noite sem destino definido.</p><p><em>"Vai onde o coração mandar"</em>, dizia a última linha do bilhete encontrado entre as páginas.</p>`,
];

let livroLeitura = null;

function abrirLeitura(p) {
  livroLeitura = p;
  document.getElementById('leitura-titulo').textContent = `📖 ${p.nome}`;
  document.getElementById('leitura-overlay').style.display = 'flex';
  gerarTrechoLeitura();
}

function gerarTrechoLeitura() {
  if (!livroLeitura) return;
  const corpo = document.getElementById('leitura-corpo');
  corpo.innerHTML = '<p class="leitura__gerando">✨ Carregando trecho...</p>';
  setTimeout(() => {
    const fn = TRECHOS[Math.floor(Math.random() * TRECHOS.length)];
    corpo.innerHTML = `<div class="leitura__texto">${fn(livroLeitura.nome, livroLeitura.descricao)}</div>`;
  }, 600);
}

function fecharLeitura() {
  document.getElementById('leitura-overlay').style.display = 'none';
  livroLeitura = null;
}


function abrirAnuncio(p) {
  const avaliacao = p.preco != null ? Number(p.preco).toFixed(1) : '?';
  const estrelas  = '⭐'.repeat(Math.round(Number(p.preco || 0)));
  const paginas   = p.estoque ? `${p.estoque} páginas` : 'edição especial';
  const ano       = p.precoAntigo || 'recente';

  document.getElementById('anuncio-corpo').innerHTML = `
    <div class="anuncio__capa-wrap">
      ${p.imagemUrl
        ? `<img src="${esc(p.imagemUrl)}" alt="${esc(p.nome)}" class="anuncio__capa" onerror="this.style.display='none'" />`
        : `<div class="anuncio__sem-capa">📖</div>`}
    </div>
    <div class="anuncio__texto">
      <p class="anuncio__chamada">✨ LANÇAMENTO DA SEMANA ✨</p>
      <h2 class="anuncio__titulo">${esc(p.nome)}</h2>
      <p class="anuncio__autor">${esc(p.descricao || 'Uma obra inesquecível')}</p>
      <div class="anuncio__estrelas">${estrelas} <strong>${avaliacao}/5</strong></div>
      <ul class="anuncio__lista">
        <li>📚 ${paginas} de pura emoção</li>
        <li>📅 Publicado em ${ano}</li>
        <li>🎁 Frete grátis para todo o Brasil</li>
        <li>🔖 Inclui marcador exclusivo</li>
      </ul>
      <div class="anuncio__preco">
        <span class="anuncio__de">De R$ 59,90</span>
        <span class="anuncio__por">R$ 34,90</span>
        <span class="anuncio__parcelas">ou 3x de R$ 11,63 sem juros</span>
      </div>
    </div>
  `;
  document.getElementById('anuncio-overlay').style.display = 'flex';
}

function fecharAnuncio() {
  document.getElementById('anuncio-overlay').style.display = 'none';
}


async function carregarCategorias() {
  try {
    const cats = await apiListarCategorias();
    const sel = document.getElementById('f-categoria');
    sel.innerHTML = '<option value="">— Selecione —</option>';

    const lista = (cats && cats.length > 0) ? cats : GENEROS_LIVROS.map((n, i) => ({ id: i + 1, nome: n }));
    lista.forEach(c => {
      const op = document.createElement('option');
      op.value = c.id;
      op.textContent = c.nome;
      sel.appendChild(op);
    });
  } catch (e) {
    // Fallback: gêneros fixos
    const sel = document.getElementById('f-categoria');
    sel.innerHTML = '<option value="">— Selecione —</option>';
    GENEROS_LIVROS.forEach((n, i) => {
      const op = document.createElement('option');
      op.value = i + 1;
      op.textContent = n;
      sel.appendChild(op);
    });
  }
}

function abrirModalNovo() {
  editandoId = null;
  document.getElementById('modal-titulo').textContent = '📖 Novo Livro';
  document.getElementById('form-produto').reset();
  document.getElementById('erro-form').textContent = '';
  document.getElementById('btn-salvar').textContent = 'Adicionar';
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('f-nome').focus();
}

function abrirModalEditar(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  editandoId = id;
  document.getElementById('modal-titulo').textContent    = '✏️ Editar Livro';
  document.getElementById('f-nome').value                = p.nome        || '';
  document.getElementById('f-descricao').value           = p.descricao   || '';
  document.getElementById('f-preco').value               = p.preco       ?? '';
  document.getElementById('f-preco-antigo').value        = p.precoAntigo || '';
  document.getElementById('f-imagem').value              = p.imagemUrl   || '';
  document.getElementById('f-estoque').value             = p.estoque     || '';
  document.getElementById('f-destaque').checked          = p.emDestaque  || false;
  document.getElementById('f-categoria').value           = p.categoriaId || p.categoria?.id || '';
  document.getElementById('erro-form').textContent       = '';
  document.getElementById('btn-salvar').textContent      = 'Salvar alterações';
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('f-nome').focus();
}

function fecharModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

async function handleSalvar(event) {
  event.preventDefault();
  const erroEl = document.getElementById('erro-form');
  const btn    = document.getElementById('btn-salvar');
  erroEl.textContent = '';

  const dados = {
    nome:        document.getElementById('f-nome').value.trim(),
    descricao:   document.getElementById('f-descricao').value.trim()  || undefined,
    preco:       parseFloat(document.getElementById('f-preco').value),
    precoAntigo: document.getElementById('f-preco-antigo').value
                   ? parseFloat(document.getElementById('f-preco-antigo').value) : undefined,
    categoriaId: document.getElementById('f-categoria').value
                   ? parseInt(document.getElementById('f-categoria').value)      : undefined,
    imagemUrl:   document.getElementById('f-imagem').value.trim()     || undefined,
    estoque:     document.getElementById('f-estoque').value
                   ? parseInt(document.getElementById('f-estoque').value)        : undefined,
    emDestaque:  document.getElementById('f-destaque').checked,
    ativo:       true,
  };

  if (!dados.nome)       { erroEl.textContent = 'O título é obrigatório.';          return; }
  if (isNaN(dados.preco)){ erroEl.textContent = 'Informe uma avaliação válida (0–5).'; return; }

  Object.keys(dados).forEach(k => dados[k] === undefined && delete dados[k]);

  if (editandoId) {
    setBtnLoading(btn, true, 'Salvando...');
    try {
      await apiAtualizarProduto(editandoId, dados);
      mostrarToast('✅ Livro atualizado!');
      fecharModal();
      await carregarProdutos();
    } catch (e) {
      erroEl.textContent = e.message;
    } finally {
      setBtnLoading(btn, false, 'Salvar alterações');
    }
  } else {
    setBtnLoading(btn, true, 'Adicionando...');
    try {
      await apiCriarProduto(dados);
      mostrarToast('✅ Livro adicionado à estante!');
      fecharModal();
      await carregarProdutos();
    } catch (e) {
      erroEl.textContent = e.message;
    } finally {
      setBtnLoading(btn, false, 'Adicionar');
    }
  }
}

async function handleDeletar(id, nome) {
  if (!confirm(`🗑️ Remover "${nome}" da estante?\nEssa ação não pode ser desfeita.`)) return;
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) card.style.opacity = '0.4';
  try {
    await apiDeletarProduto(id);
    mostrarToast('🗑️ Livro removido.');
    await carregarProdutos();
  } catch (e) {
    if (card) card.style.opacity = '1';
    mostrarToast(e.message, 'erro');
  }
}

let toastTimer;
function mostrarToast(msg, tipo = 'sucesso') {
  clearTimeout(toastTimer);
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast--${tipo}`;
  el.style.display = 'block';
  toastTimer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setBtnLoading(btn, loading, texto) {
  btn.disabled = loading;
  btn.textContent = texto;
  btn.style.opacity = loading ? '0.7' : '1';
}
