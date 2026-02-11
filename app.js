// 🔥 Firebase v10 Modular

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
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, auth } from "./firebase.js";

// =============================
// 🔹 ATUALIZAR BARRA DE PROGRESSO
// =============================
function atualizarBarra(meta, arrecadado) {
  const porcentagem = meta > 0 ? (arrecadado / meta) * 100 : 0;
  document.getElementById("barraProgresso").style.width = porcentagem + "%";
}

// =============================
// 🔹 CARREGAR META (Real-time)
// =============================
function carregarMetaRealTime() {
  const docRef = doc(db, "metaRetiro", "dados");
  
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const dados = docSnap.data();
      const meta = dados.meta || 0;
      const arrecadado = dados.arrecadado || 0;

      document.getElementById("metaValor").innerText = meta;
      document.getElementById("arrecadadoValor").innerText = arrecadado;

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
      item.innerText = `${dados.descricao || "Saída"} - R$ ${dados.valor || 0}`;
      lista.appendChild(item);
    });
  }, (error) => {
    console.error("Erro ao carregar saídas:", error);
  });
}

// =============================
// 🔹 AUTENTICAÇÃO
// =============================

// Login
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
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro no login: " + error.message);
  }
}

// Logout
async function logout() {
  try {
    await signOut(auth);
    alert("Desconectado com sucesso!");
  } catch (error) {
    console.error("Erro ao desconectar:", error);
    alert("Erro ao desconectar: " + error.message);
  }
}

// Monitorar estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário autenticado:", user.email);
  } else {
    console.log("Usuário não autenticado");
  }
});

// =============================
// 🔹 ATUALIZAR META
// =============================
async function atualizarMeta() {
  const novaMetaInput = document.getElementById("novaMetaInput")?.value;

  if (!novaMetaInput || isNaN(novaMetaInput)) {
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

  if (!valorInput || isNaN(valorInput)) {
    alert("Insira um valor válido");
    return;
  }

  try {
    const docRef = doc(db, "metaRetiro", "dados");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const arrecadadoAtual = docSnap.data().arrecadado || 0;
      const novoArrecadado = arrecadadoAtual + parseFloat(valorInput);

      await updateDoc(docRef, {
        arrecadado: novoArrecadado
      });

      alert("Valor adicionado com sucesso!");
      document.getElementById("valorInput").value = "";
    }
  } catch (error) {
    console.error("Erro ao adicionar valor:", error);
    alert("Erro ao adicionar valor: " + error.message);
  }
}

// =============================
// 🚀 INICIALIZA
// =============================
document.addEventListener("DOMContentLoaded", () => {
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
window.carregarMetaRealTime = carregarMetaRealTime;
window.carregarSaidasRealTime = carregarSaidasRealTime;
