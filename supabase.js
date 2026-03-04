// supabase.js

const SUPABASE_URL = "https://gkbevticlgygbknkronc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrYmV2dGljbGd5Z2Jrbmtyb25jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU0NjgwMiwiZXhwIjoyMDg4MTIyODAyfQ.hnwVGHI6Ng9bnwHCQaILAh5vTUmmPkGP0YSh2baKrM4";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------- LOGIN ----------------------
async function login(username, password) {
  const { data, error } = await client
    .from("usuarios")
    .select("tipoacesso")
    .eq("username", username)
    .eq("password_hash", password);

  if (error) {
    console.error("Erro ao buscar usuário:", error);
    return "NOT_FOUND";
  }

  if (data.length > 0) {
    return data[0].tipoacesso;
  } else {
    return "NOT_FOUND";
  }
}

// ---------------------- PESSOAS ----------------------
async function carregarPessoas() {
  const { data, error } = await client
    .from("pessoas")
    .select("*");

  if (error) {
    console.error("Erro ao carregar pessoas:", error);
    return;
  }

  const tbody = document.getElementById("tabela-pessoas");
  tbody.innerHTML = "";

  data.forEach(pessoa => {
    const tr = document.createElement("tr");
    ["id", "bairro", "dirigente", "saida"].forEach(coluna => {
      const td = document.createElement("td");
      td.textContent = pessoa[coluna];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

async function getPessoas() {
  const { data, error } = await client
    .from("pessoas")
    .select("*");

  if (error) {
    console.error("Erro ao carregar pessoas:", error);
    return [];
  }
  return data;
}

async function adicionarPessoa(bairro, dirigente, saida) {
  const { error } = await client
    .from("pessoas")
    .insert([{ bairro, dirigente, saida }]);

  if (error) {
    console.error("Erro ao inserir pessoa:", error);
    return false;
  }
  return true;
}

async function removerPessoa(id) {
  const { error } = await client
    .from("pessoas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover pessoa:", error);
    return false;
  }
  return true;
}

// ---------------------- USUÁRIOS ----------------------

// GET usuários
async function getUsuarios() {
  const { data, error } = await client
    .from("usuarios")
    .select("id, username, tipoacesso");

  if (error) {
    console.error("Erro ao carregar usuários:", error);
    return [];
  }
  return data;
}

// POST usuários (adicionar ou atualizar senha)
async function postUsuario(username, password_hash, tipoacesso) {
  const { error } = await client
    .from("usuarios")
    .upsert([{ username, password_hash, tipoacesso }], { onConflict: "username" });

  if (error) {
    console.error("Erro ao salvar usuário:", error);
    return false;
  }
  return true;
}

// DELETE usuários
async function deleteUsuario(username) {
  const { error } = await client
    .from("usuarios")
    .delete()
    .eq("username", username);

  if (error) {
    console.error("Erro ao remover usuário:", error);
    return false;
  }
  return true;
}

// Renderizar tabela de usuários
async function carregarUsuarios() {
  const usuarios = await getUsuarios();
  const tbody = document.getElementById("tabela-usuarios");
  tbody.innerHTML = "";

  usuarios.forEach(usuario => {
    const tr = document.createElement("tr");
    ["username", "tipoacesso"].forEach(coluna => {
      const td = document.createElement("td");
      td.textContent = usuario[coluna];
      tr.appendChild(td);
    });

    const tdAcoes = document.createElement("td");
    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.onclick = () => deleteUsuario(usuario.username).then(() => carregarUsuarios());
    tdAcoes.appendChild(btnRemover);

    tr.appendChild(tdAcoes);
    tbody.appendChild(tr);
  });
}