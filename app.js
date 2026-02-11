// 🔥 Firebase v10 Modular - App Completo

import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  doc, 
  getDoc,
  getDocs, 
  collection,
  updateDoc,
  addDoc,
  onSnapshot,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, auth } from "./firebase.js";

// =============================
// 🔹 ATUALIZAR BARRA DE PROGRESSO
// =============================
function atualizarBarra(meta, arrecadado) {
  const porcentagem = meta > 0 ? (arrecadado / meta) * 100 : 0;
  const barraElement = document.getElementById("barraProgresso");
  if (barraElement) {
    barraElement.style.width = porcentagem + "%";
  }
}

// =============================
// 🔹 CARREGAR META E ARRECADADO (Real-time)
// =============================
function carregarMetaRealTime() {
  const docRef = doc(db, "metaRetiro", "dados");
  
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const dados = docSnap.data();
      const meta = dados.meta || 0;
      const arrecadado = dados.arrecadado || 0;

      const metaElement = document.getElementById("metaValor");
      const arrecadadoElement = document.getElementById("arrecadadoValor");

      if (metaElement) metaElement.innerText = meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      if (arrecadadoElement) arrecadadoElement.innerText = arrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      atualizarBarra(meta, arrecadado);
    }
  }, (error) => {
    console.error("Erro ao carregar meta:", error);
  });
}

// =============================
// 🔹 CARREGAR SAÍDAS (Real-time)
// =============================
function carregarSaidasRealTime() {
  const colRef = collection(db, "saidas");
  
  onSnapshot(colRef, (querySnapshot) => {
    const lista = document.getElementById("listaSaidas");

    if (!lista) return;

    lista.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      const item = document.createElement("li");
      const valor = parseFloat(dados.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      item.innerText = `${dados.descricao || "Saída"} - ${valor}`;
      lista.appendChild(item);
    });
  }, (error) => {
    console.error("Erro ao carregar saídas:", error);
  });
}

// =============================
// 🔹 AUTENTICAÇÃO - LOGIN
// =============================
async function login() {
  const email = document.getElementById("email")?.value;
  const senha = document.getElementById("senha")?.value;

  if (!email || !senha) {
    alert("Preencha email e senha");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado com sucesso!");
    // Limpar campos
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro no login: " + error.message);
  }
}

// =============================
// 🔹 AUTENTICAÇÃO - LOGOUT
// =============================
async function logout() {
  try {
    await signOut(auth);
    alert("Desconectado com sucesso!");
  } catch (error) {
    console.error("Erro ao desconectar:", error);
    alert("Erro ao desconectar: " + error.message);
  }
}

// =============================
// 🔹 MONITORAR ESTADO DE AUTENTICAÇÃO
// =============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Usuário autenticado:", user.email);
    const adminArea = document.getElementById("adminArea");
    if (adminArea) {
      adminArea.style.display = "block";
    }
  } else {
    console.log("❌ Usuário não autenticado");
    const adminArea = document.getElementById("adminArea");
    if (adminArea) {
      adminArea.style.display = "none";
    }
  }
});

// =============================
// 🔹 ATUALIZAR META
// =============================
async function atualizarMeta() {
  const novaMetaInput = document.getElementById("novaMetaInput")?.value;

  if (!novaMetaInput || isNaN(novaMetaInput) || parseFloat(novaMetaInput) <= 0) {
    alert("Insira um valor válido para a meta");
    return;
  }

  try {
    const docRef = doc(db, "metaRetiro", "dados");
    await updateDoc(docRef, {
      meta: parseFloat(novaMetaInput)
    });
    alert("Meta atualizada com sucesso!");
    document.getElementById("novaMetaInput").value = "";
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    alert("Erro ao atualizar meta: " + error.message);
  }
}

// =============================
// 🔹 ADICIONAR VALOR ARRECADADO
// =============================
async function adicionarValor() {
  const valorInput = document.getElementById("valorInput")?.value;

  if (!valorInput || isNaN(valorInput) || parseFloat(valorInput) <= 0) {
    alert("Insira um valor válido");
    return;
  }

  try {
    const docRef = doc(db, "metaRetiro", "dados");
    
    // Usar increment para somar atomicamente
    await updateDoc(docRef, {
      arrecadado: increment(parseFloat(valorInput))
    });

    alert("Valor adicionado com sucesso!");
    document.getElementById("valorInput").value = "";
  } catch (error) {
    console.error("Erro ao adicionar valor:", error);
    alert("Erro ao adicionar valor: " + error.message);
  }
}

// =============================
// 🔹 REGISTRAR SAÍDA
// =============================
async function registrarSaida() {
  const descricaoInput = document.getElementById("descricaoSaida")?.value;
  const valorSaidaInput = document.getElementById("valorSaida")?.value;

  if (!descricaoInput || !descricaoInput.trim()) {
    alert("Insira uma descrição para a saída");
    return;
  }

  if (!valorSaidaInput || isNaN(valorSaidaInput) || parseFloat(valorSaidaInput) <= 0) {
    alert("Insira um valor válido para a saída");
    return;
  }

  try {
    const colRef = collection(db, "saidas");
    await addDoc(colRef, {
      descricao: descricaoInput.trim(),
      valor: parseFloat(valorSaidaInput),
      data: new Date()
    });

    alert("Saída registrada com sucesso!");
    document.getElementById("descricaoSaida").value = "";
    document.getElementById("valorSaida").value = "";
  } catch (error) {
    console.error("Erro ao registrar saída:", error);
    alert("Erro ao registrar saída: " + error.message);
  }
}

// =============================
// 🚀 INICIALIZA
// =============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App iniciado");
  carregarMetaRealTime();
  carregarSaidasRealTime();
});

// =============================
// 🌐 EXPONHA FUNÇÕES GLOBALMENTE
// =============================
window.login = login;
window.logout = logout;
window.atualizarMeta = atualizarMeta;
window.adicionarValor = adicionarValor;
window.registrarSaida = registrarSaida;
window.carregarMetaRealTime = carregarMetaRealTime;
window.carregarSaidasRealTime = carregarSaidasRealTime;
