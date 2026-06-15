'use strict'

const BASE_URL = 'https://base-back-dwpz.onrender.com';

function getToken() {
  return localStorage.getItem('token');
}

function headersAuth() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}


async function apiCadastrar(nome, email, senha) {
  const res = await fetch(`${BASE_URL}/cadastrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, papel: 'editor' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.detail || 'Erro ao cadastrar');
  return data;
}

async function apiEntrar(email, senha) {
  const res = await fetch(`${BASE_URL}/entrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.detail || 'Email ou senha incorretos');
  return data; // espera { token: '...' } ou { access_token: '...' }
}


// GET /produtos
async function apiListarProdutos() {
  const res = await fetch(`${BASE_URL}/produtos`, {
    headers: headersAuth(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao listar produtos');
  return data;
}

// GET /produtos/:id
async function apiBuscarProduto(id) {
  const res = await fetch(`${BASE_URL}/produtos/${id}`, {
    headers: headersAuth(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao buscar produto');
  return data;
}

// POST /produtos
async function apiCriarProduto(dados) {
  const res = await fetch(`${BASE_URL}/produtos`, {
    method: 'POST',
    headers: headersAuth(),
    body: JSON.stringify(dados),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao criar produto');
  return data;
}

// PATCH /produtos/:id — atualização parcial (ex: alternar destaque)
async function apiAtualizarProdutoParcial(id, dados) {
  const res = await fetch(`${BASE_URL}/produtos/${id}`, {
    method: 'PATCH',
    headers: headersAuth(),
    body: JSON.stringify(dados),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao atualizar produto');
  return data;
}

// PUT /produtos/:id — atualização completa (formulário de edição)
async function apiAtualizarProdutoCompleto(id, dados) {
  const res = await fetch(`${BASE_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: headersAuth(),
    body: JSON.stringify(dados),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao atualizar produto');
  return data;
}

// DELETE /produtos/:id
async function apiDeletarProduto(id) {
  const res = await fetch(`${BASE_URL}/produtos/${id}`, {
    method: 'DELETE',
    headers: headersAuth(),
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao deletar produto');
  return data;
}

// ---- Categorias ----

async function apiListarCategorias() {
  const res = await fetch(`${BASE_URL}/categorias`, {
    headers: headersAuth(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao listar categorias');
  return data;
}
