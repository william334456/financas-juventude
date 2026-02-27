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
  Timestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.login = function () {
  document.getElementById("loginArea").style.display = "none";
  document.getElementById("adminArea").style.display = "block";
  atualizarResumo();
}

// atualiza o valor arrecadado adicionando ao campo 'atual' no Firestore
window.atualizarMeta = async function () {
  const novoValor = Number(document.getElementById("novoValor").value);

  if (isNaN(novoValor) || novoValor <= 0) {
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

    await updateDoc(ref, {
      atual: novoTotal
    });

    document.getElementById("novoValor").value = "";
    alert("Valor adicionado com sucesso!");
  } catch (error) {
    alert("Erro ao atualizar: " + error.message);
  }
};

function logout() {
  document.getElementById("loginArea").style.display = "block";
  document.getElementById("adminArea").style.display = "none";
}

let financeChart = null;

async function atualizarResumo() {
  const totalEntradasEl = document.getElementById("totalEntradas");
  const totalSaidasEl = document.getElementById("totalSaidas");
  const saldoEl = document.getElementById("saldoAtual");
  const tabelaBody = document.querySelector("#tabelaHistorico tbody");

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  console.log("Resumo carregando...");

  try {
    const q = query(collection(db, "financeiro"), orderBy("data", "desc"));
    const snapshot = await getDocs(q);
    console.log(snapshot.size);

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
          <td>${formatter.format(valor)}</td>
          <td>${dateStr}</td>
        `;

        tabelaBody.appendChild(tr);
      }
    });

    if (totalEntradasEl) totalEntradasEl.innerText = formatter.format(totalEntradas);
    if (totalSaidasEl) totalSaidasEl.innerText = formatter.format(totalSaidas);
    const saldo = totalEntradas - totalSaidas;
    if (saldoEl) {
      saldoEl.innerText = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldo);
      saldoEl.style.color = saldo < 0 ? "#ef4444" : "#22c55e";
    }

    // update chart
    const ctx = document.getElementById('financeChart').getContext('2d');
    const data = {
      labels: ['Entradas', 'Saídas'],
      datasets: [{
        label: 'Valores',
        data: [totalEntradas, totalSaidas],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderRadius: 5
      }]
    };

    const config = {
      type: 'bar',
      data,
      options: {
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Entradas vs Saídas' },
          tooltip: {
            callbacks: {
              label: function (context) {
                const valor = context.parsed.y;
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    if (financeChart) {
      financeChart.data.datasets[0].data = [totalEntradas, totalSaidas];
      financeChart.update();
    } else {
      financeChart = new Chart(ctx, config);
    }
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

    // Also increment saldoAtual in controleFinanceiro/caixa
    const caixaRef = doc(db, "controleFinanceiro", "caixa");
    await updateDoc(caixaRef, {
      saldoAtual: increment(valor)
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

  // Check current balance from controleFinanceiro/caixa
  let saldoAtualNum = 0;
  try {
    const caixaRef = doc(db, "controleFinanceiro", "caixa");
    const snap = await getDoc(caixaRef);
    if (snap.exists()) {
      saldoAtualNum = snap.data().saldoAtual || 0;
    }
  } catch (e) {
    console.error("Erro ao obter saldo antes de saída:", e);
  }

  if (valor > saldoAtualNum) {
    alert("Saldo insuficiente");
    return;
  }

  try {
    await addDoc(collection(db, "financeiro"), {
      tipo: "saida",
      descricao,
      valor,
      data: Timestamp.now()
    });

    // Subtract from saldoAtual in controleFinanceiro/caixa
    const caixaRef = doc(db, "controleFinanceiro", "caixa");
    await updateDoc(caixaRef, {
      saldoAtual: increment(-valor)
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

    // Also increment saldoAtual
    const caixaRef = doc(db, "controleFinanceiro", "caixa");
    await updateDoc(caixaRef, {
      saldoAtual: increment(valor)
    });

    document.getElementById("nomeRevista").value = "";
    document.getElementById("valorRevista").value = "";

    await atualizarResumo();
  } catch (error) {
    alert("Erro ao registrar revista: " + error.message);
  }
}

window.ajustarSaldoManual = async function () {
  const novoSaldo = parseFloat(document.getElementById("novoSaldoManual").value);

  if (isNaN(novoSaldo)) {
    alert("Informe um valor válido.");
    return;
  }

  try {
    const caixaRef = doc(db, "controleFinanceiro", "caixa");
    await updateDoc(caixaRef, {
      saldoAtual: novoSaldo
    });

    document.getElementById("novoSaldoManual").value = "";
    alert("Saldo ajustado com sucesso!");

    await atualizarResumo();
  } catch (error) {
    alert("Erro ao ajustar saldo: " + error.message);
  }
};

// Carrega os dados automaticamente ao abrir o painel
document.addEventListener("DOMContentLoaded", () => {
  atualizarResumo();
});

// tornar a função acessível globalmente para debugging ou chamadas externas
window.atualizarResumo = atualizarResumo;