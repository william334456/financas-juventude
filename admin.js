import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function login() {
  document.getElementById("loginArea").style.display = "none";
  document.getElementById("adminArea").style.display = "block";
  atualizarResumo();
}

// atualiza o valor arrecadado incrementando o campo 'atual' no Firestore
window.atualizarMeta = async function () {
  const novoValor = Number(document.getElementById("novoValor").value);
  const novaMeta = Number(document.getElementById("novaMeta").value);

  if (isNaN(novoValor)) {
    alert("Informe um valor válido para adicionar.");
    return;
  }

  try {
    const ref = doc(db, "metaRetiro", "dados");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Documento de meta não encontrado.");
      return;
    }

    const data = snap.data();
    const atual = data.atual || 0;
    const novoTotal = atual + novoValor;

    const updateData = { atual: novoTotal };
    if (!isNaN(novaMeta) && novaMeta > 0) {
      updateData.meta = novaMeta;
    }

    await updateDoc(ref, updateData);
    alert("Meta atualizada!");
  } catch (error) {
    alert("Erro ao atualizar meta: " + error.message);
  }
};

function logout() {
  document.getElementById("loginArea").style.display = "block";
  document.getElementById("adminArea").style.display = "none";
}

async function atualizarResumo() {
  const totalEntradasEl = document.getElementById("totalEntradas");
  const totalSaidasEl = document.getElementById("totalSaidas");
  const saldoEl = document.getElementById("saldoAtual");
  const tabelaBody = document.querySelector("#tabelaHistorico tbody");

  try {
    const col = collection(db, "financeiro");
    const q = query(col, orderBy("data", "desc"));
    const snapshot = await getDocs(q);

    let totalEntradas = 0;
    let totalSaidas = 0;

    if (tabelaBody) tabelaBody.innerHTML = "";

    snapshot.forEach((doc) => {
      const d = doc.data();
      const tipo = d.tipo || "";
      const valor = Number(d.valor || 0);

      if (tipo === "entrada") totalEntradas += valor;
      if (tipo === "saida") totalSaidas += valor;

      if (tabelaBody) {
        const tr = document.createElement("tr");
        const dateValue = d.data && typeof d.data.toDate === "function" ? d.data.toDate() : (d.data ? new Date(d.data) : null);
        const dateStr = dateValue ? dateValue.toLocaleString() : "";

        tr.innerHTML = `
          <td>${tipo}</td>
          <td>${d.descricao || ""}</td>
          <td>R$ ${valor}</td>
          <td>${dateStr}</td>
        `;

        tabelaBody.appendChild(tr);
      }
    });

    if (totalEntradasEl) totalEntradasEl.innerText = totalEntradas;
    if (totalSaidasEl) totalSaidasEl.innerText = totalSaidas;
    if (saldoEl) saldoEl.innerText = totalEntradas - totalSaidas;
  } catch (error) {
    console.error("Erro ao carregar resumo financeiro:", error);
  }
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

async function adicionarEntrada() {
  const descricao = document.getElementById("descricaoEntrada").value;
  const valor = parseFloat(document.getElementById("valorEntrada").value);

  if (!descricao || !valor) return;

  try {
    await addDoc(collection(db, "financeiro"), {
      tipo: "entrada",
      descricao,
      valor,
      data: Timestamp.now()
    });

    document.getElementById("descricaoEntrada").value = "";
    document.getElementById("valorEntrada").value = "";

    await atualizarResumo();
  } catch (error) {
    alert("Erro ao salvar entrada: " + error.message);
  }
}

async function adicionarSaida() {
  const descricao = document.getElementById("descricaoSaida").value;
  const valor = parseFloat(document.getElementById("valorSaida").value);

  if (!descricao || !valor) return;

  try {
    await addDoc(collection(db, "financeiro"), {
      tipo: "saida",
      descricao,
      valor,
      data: Timestamp.now()
    });

    document.getElementById("descricaoSaida").value = "";
    document.getElementById("valorSaida").value = "";

    await atualizarResumo();
  } catch (error) {
    alert("Erro ao salvar saída: " + error.message);
  }
}

async function registrarRevista() {
  const nome = document.getElementById("nomeRevista").value;
  const valor = parseFloat(document.getElementById("valorRevista").value);

  if (!nome || !valor) return;

  try {
    await addDoc(collection(db, "financeiro"), {
      tipo: "entrada",
      descricao: `Revista EBD - ${nome}`,
      valor,
      data: Timestamp.now()
    });

    document.getElementById("nomeRevista").value = "";
    document.getElementById("valorRevista").value = "";

    await atualizarResumo();
  } catch (error) {
    alert("Erro ao registrar revista: " + error.message);
  }
}

// Carrega os dados automaticamente ao abrir o painel
document.addEventListener("DOMContentLoaded", () => {
  atualizarResumo();
});