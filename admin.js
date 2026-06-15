'use strict'
let produtos = [];
let categorias = [];
let editandoId = null;

const GENEROS_LIVROS = [
  'Romance', 'Ficção Científica', 'Terror', 'Fantasia',
  'Biografia', 'Aventura', 'Clássico', 'Suspense',
  'Autoajuda', 'Poesia', 'HQ / Mangá', 'Infantil',
  'Policial', 'Histórico', 'Filosofia', 'Conto'
];

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) fecharModal();
  });

  const token = localStorage.getItem('token');
  if (!token) {
    document.getElementById('tela-bloqueada').style.display = 'flex';
    document.getElementById('tela-bloqueada').style.cssText =
      'display:flex; min-height:100vh; align-items:center; justify-content:center; padding:1rem;';
    return;
  }

  document.getElementById('tela-admin').style.display = 'block';
  document.getElementById('header-usuario').textContent =
    localStorage.getItem('usuario_email') || '';

  carregarCategorias();
  carregarProdutos();
});

function irParaMarketplace() {
  window.location.href = 'index.html';
}
function irParaLogin() {
  window.location.href = 'index.html';
}
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario_email');
  window.location.href = 'index.html';
}

async function carregarCategorias() {
  const selFiltro = document.getElementById('select-genero');
  const selForm   = document.getElementById('f-categoria');
  selFiltro.innerHTML = '<option value="">Todos os gêneros</option>';
  selForm.innerHTML   = '<option value="">— Selecione —</option>';

  try {
    const todas = await apiListarCategorias();

    categorias = (todas || []).filter(c =>
      GENEROS_LIVROS.some(g => g.toLowerCase() === (c.nome || '').toLowerCase())
    );

    const lista = (categorias.length > 0)
      ? categorias
      : GENEROS_LIVROS.map((n, i) => ({ id: i + 1, nome: n }));

    lista.forEach(c => {
      const op1 = document.createElement('option');
      op1.value = c.id; op1.textContent = c.nome;
      selFiltro.appendChild(op1);

      const op2 = document.createElement('option');
      op2.value = c.id; op2.textContent = c.nome;
      selForm.appendChild(op2);
    });
  } catch (e) {
    GENEROS_LIVROS.forEach((n, i) => {
      [selFiltro, selForm].forEach(sel => {
        const op = document.createElement('option');
        op.value = i + 1; op.textContent = n;
        sel.appendChild(op);
      });
    });
  }
}

async function carregarProdutos() {
  const grid  = document.getElementById('livros-grid');
  const vazio = document.getElementById('estado-vazio');

  vazio.textContent = '⏳ Carregando livros...';
  vazio.style.display = 'block';
  grid.querySelectorAll('.card').forEach(c => c.remove());

  try {
    produtos = await apiListarProdutos();
    aplicarFiltros();
  } catch (e) {
    vazio.textContent = 'Erro ao carregar. Tente novamente.';
    mostrarToast(e.message, 'erro');
  }
}

function aplicarFiltros() {
  const termo  = document.getElementById('input-busca').value.toLowerCase();
  const genero = document.getElementById('select-genero').value;

  let lista = produtos.filter(p => {
    const nomeOk   = p.nome?.toLowerCase().includes(termo);
    const catId    = p.categoriaId ?? p.categoria?.id ?? '';
    const generoOk = !genero || String(catId) === String(genero);
    return nomeOk && generoOk;
  });

  renderizarProdutos(lista);
}

function renderizarProdutos(lista) {
  const grid  = document.getElementById('livros-grid');
  const vazio = document.getElementById('estado-vazio');

  grid.querySelectorAll('.card').forEach(c => c.remove());

  if (!lista || lista.length === 0) {
    vazio.textContent = produtos.length === 0
      ? 'Nenhum livro cadastrado ainda. Adicione o primeiro!'
      : 'Nenhum livro encontrado com esse filtro.';
    vazio.style.display = 'block';
    return;
  }
  vazio.style.display = 'none';

  lista.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card' + (p.emDestaque ? ' card--destaque' : '');
    card.dataset.id = p.id;

    const catNomeApi   = p.categoria?.nome || '';
    const ehGeneroLivro = GENEROS_LIVROS.some(g => g.toLowerCase() === catNomeApi.toLowerCase());
    const nomeCategoria = ehGeneroLivro ? catNomeApi : '';
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
      <div class="card__acoes card__acoes--admin">
        <button class="btn ${p.emDestaque ? 'btn--destaque-on' : 'btn--destaque-off'} btn--icone"
                onclick="alternarDestaque(${p.id}, ${!p.emDestaque})" title="Alternar destaque (PATCH)">🌟</button>
        <button class="btn btn--secundario" onclick="abrirModalEditar(${p.id})">✏️ Editar</button>
        <button class="btn btn--perigo" onclick="handleDeletar(${p.id},'${esc(p.nome)}')">🗑️ Excluir</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function filtrarCards() { aplicarFiltros(); }
async function alternarDestaque(id, novoValor) {
  try {
    await apiAtualizarProdutoParcial(id, { emDestaque: novoValor });
    mostrarToast(novoValor ? '🌟 Marcado como destaque!' : 'Destaque removido.');
    await carregarProdutos();
  } catch (e) {
    mostrarToast(e.message, 'erro');
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
  document.getElementById('modal-titulo').textContent    = ' Editar Livro';
  document.getElementById('f-nome').value                = p.nome        || '';
  document.getElementById('f-descricao').value           = p.descricao   || '';
  document.getElementById('f-preco').value               = p.preco       ?? '';
  document.getElementById('f-preco-antigo').value         = p.precoAntigo || '';
  document.getElementById('f-imagem').value              = p.imagemUrl   || '';
  document.getElementById('f-estoque').value             = p.estoque     || '';
  document.getElementById('f-destaque').checked          = p.emDestaque  || false;
  document.getElementById('f-categoria').value           = p.categoriaId || p.categoria?.id || '';
  document.getElementById('erro-form').textContent       = '';
  document.getElementById('btn-salvar').textContent      = 'Salvar alterações (PUT)';
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

  if (!dados.nome)        { erroEl.textContent = 'O título é obrigatório.';            return; }
  if (isNaN(dados.preco)) { erroEl.textContent = 'Informe uma avaliação válida (0–5).'; return; }

  Object.keys(dados).forEach(k => dados[k] === undefined && delete dados[k]);

  if (editandoId) {
    // PUT — substitui o produto inteiro
    setBtnLoading(btn, true, 'Salvando (PUT)...');
    try {
      await apiAtualizarProdutoCompleto(editandoId, dados);
      mostrarToast('✅ Livro atualizado (PUT)!');
      fecharModal();
      await carregarProdutos();
    } catch (e) {
      erroEl.textContent = e.message;
    } finally {
      setBtnLoading(btn, false, 'Salvar alterações (PUT)');
    }
  } else {
    // POST — cria novo produto
    setBtnLoading(btn, true, 'Adicionando (POST)...');
    try {
      await apiCriarProduto(dados);
      mostrarToast('✅ Livro adicionado ao marketplace!');
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
  if (!confirm(`🗑️ Remover "${nome}" do marketplace?\nEssa ação não pode ser desfeita.`)) return;
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
