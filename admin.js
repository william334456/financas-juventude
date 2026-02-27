let entradas = 0;
let saidas = 0;

function login() {
  document.getElementById("loginArea").style.display = "none";
  document.getElementById("adminArea").style.display = "block";
}

function logout() {
  document.getElementById("loginArea").style.display = "block";
  document.getElementById("adminArea").style.display = "none";
}

function atualizarResumo() {
  document.getElementById("totalEntradas").innerText = entradas;
  document.getElementById("totalSaidas").innerText = saidas;
  document.getElementById("saldoAtual").innerText = entradas - saidas;
}

function adicionarLinha(tipo, descricao, valor) {
  const tabela = document.querySelector("#tabelaHistorico tbody");

  const linha = document.createElement("tr");

  linha.innerHTML = `
    <td>${tipo}</td>
    <td>${descricao}</td>
    <td>R$ ${valor}</td>
    <td>${new Date().toLocaleDateString()}</td>
  `;

  tabela.appendChild(linha);
}

function adicionarEntrada() {
  const descricao = document.getElementById("descricaoEntrada").value;
  const valor = parseFloat(document.getElementById("valorEntrada").value);

  if (!descricao || !valor) return;

  entradas += valor;

  adicionarLinha("Entrada", descricao, valor);
  atualizarResumo();

  document.getElementById("descricaoEntrada").value = "";
  document.getElementById("valorEntrada").value = "";
}

function adicionarSaida() {
  const descricao = document.getElementById("descricaoSaida").value;
  const valor = parseFloat(document.getElementById("valorSaida").value);

  if (!descricao || !valor) return;

  saidas += valor;

  adicionarLinha("Saída", descricao, valor);
  atualizarResumo();

  document.getElementById("descricaoSaida").value = "";
  document.getElementById("valorSaida").value = "";
}

function registrarRevista() {
  const nome = document.getElementById("nomeRevista").value;
  const valor = parseFloat(document.getElementById("valorRevista").value);

  if (!nome || !valor) return;

  entradas += valor;

  adicionarLinha("Revista EBD", nome, valor);
  atualizarResumo();

  document.getElementById("nomeRevista").value = "";
  document.getElementById("valorRevista").value = "";
}
