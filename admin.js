import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  updateDoc,
  addDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// LOGIN
window.login = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert("Login realizado!");
    })
    .catch((error) => {
      alert("Erro no login");
    });
};

// LOGOUT
window.logout = function () {
  signOut(auth);
};

// CONTROLE VISUAL
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("loginArea").style.display = "none";
    document.getElementById("adminArea").style.display = "block";
    carregarResumo();
  } else {
    document.getElementById("loginArea").style.display = "block";
    document.getElementById("adminArea").style.display = "none";
  }
});

// ATUALIZAR META
window.atualizarMeta = async function () {
  const novaMeta = Number(document.getElementById("novaMeta").value);
  const novoValor = Number(document.getElementById("novoValor").value);

  const docRef = doc(db, "metaRetiro", "dados");

  await updateDoc(docRef, {
    meta: novaMeta,
    atual: novoValor
  });

  alert("Meta atualizada!");
};

// ADICIONAR ENTRADA
window.adicionarEntrada = async function () {
  const descricao = document.getElementById("descricaoEntrada").value;
  const valor = Number(document.getElementById("valorEntrada").value);

  await addDoc(collection(db, "financeiro"), {
    tipo: "entrada",
    descricao: descricao,
    valor: valor,
    data: new Date()
  });

  alert("Entrada registrada!");
  carregarResumo();
};

// REGISTRAR REVISTA
window.registrarRevista = async function () {
  const nome = document.getElementById("nomeRevista").value;
  const valor = Number(document.getElementById("valorRevista").value);

  await addDoc(collection(db, "revistas"), {
    nome: nome,
    valor: valor,
    data: new Date()
  });

  alert("Revista registrada!");
};

// CARREGAR RESUMO
async function carregarResumo() {
  const querySnapshot = await getDocs(collection(db, "financeiro"));
  let total = 0;

  querySnapshot.forEach((doc) => {
    total += doc.data().valor;
  });

  document.getElementById("totalEntradas").innerText = total;
}
