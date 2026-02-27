import { db, auth } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const metaRef = doc(db, "metaRetiro", "dados");
const saidasRef = collection(db, "saidas");

let meta = 0;
let atual = 0;

/* =========================
   LOGIN
========================= */

window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado!");
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
};

window.logout = async function () {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  const loginArea = document.getElementById("loginArea");
  const adminArea = document.getElementById("adminArea");

  if (loginArea && adminArea) {
    if (user) {
      loginArea.style.display = "none";
      adminArea.style.display = "block";
    } else {
      loginArea.style.display = "block";
      adminArea.style.display = "none";
    }
  }
});

/* =========================
   META EM TEMPO REAL
========================= */

onSnapshot(metaRef, (docSnap) => {
  if (docSnap.exists()) {
    const dados = docSnap.data();
    meta = dados.meta;
    atual = dados.atual;

    atualizarTela();
  }
});

function atualizarTela() {
  const metaEl = document.getElementById("metaValor");
  const arrecEl = document.getElementById("arrecadadoValor");
  const barra = document.getElementById("barraProgresso");

  if (metaEl) metaEl.innerText = meta;
  if (arrecEl) arrecEl.innerText = atual;

  if (barra && meta > 0) {
    const porcentagem = (atual / meta) * 100;
    barra.style.width = porcentagem + "%";
  }
}

/* =========================
   ATUALIZAR META
========================= */

window.atualizarMeta = async function () {
  const novaMeta = Number(document.getElementById("novaMeta").value);
  const novoValor = Number(document.getElementById("novoValor").value);

  try {
    await updateDoc(metaRef, {
      meta: novaMeta,
      atual: novoValor
    });

    alert("Meta atualizada!");
  } catch (error) {
    alert("Erro ao atualizar meta: " + error.message);
  }
};

/* =========================
   ADICIONAR ENTRADA
========================= */

window.adicionarEntrada = async function () {
  const valor = Number(document.getElementById("valorEntrada").value);

  try {
    await updateDoc(metaRef, {
      atual: atual + valor
    });

    alert("Entrada adicionada!");
  } catch (error) {
    alert("Erro ao adicionar entrada: " + error.message);
  }
};

/* =========================
   ADICIONAR SAÍDA
========================= */

window.adicionarSaida = async function () {
  const descricao = document.getElementById("descricaoSaida").value;
  const valor = Number(document.getElementById("valorSaida").value);

  try {
    await addDoc(saidasRef, {
      descricao,
      valor,
      data: Timestamp.now()
    });

    await updateDoc(metaRef, {
      atual: atual - valor
    });

    alert("Saída registrada!");
  } catch (error) {
    alert("Erro ao registrar saída: " + error.message);
  }
};

/* =========================
   REGISTRAR REVISTA
========================= */

window.registrarRevista = async function () {
  const nome = document.getElementById("nomeRevista").value;
  const valor = Number(document.getElementById("valorRevista").value);

  if (!nome || !valor) {
    alert("Preencha nome e valor da revista.");
    return;
  }

  try {
    const revistasRef = collection(db, "revistas");
    await addDoc(revistasRef, {
      nome,
      valor,
      data: Timestamp.now()
    });

    // também atualiza o total arrecadado
    await updateDoc(metaRef, {
      atual: atual + valor
    });

    alert("Revista registrada!");
  } catch (error) {
    alert("Erro ao registrar revista: " + error.message);
  }
};

/* =========================
   LISTAR SAÍDAS
========================= */

// (Nenhuma alteração necessária aqui, mas mantemos o comentário.)


onSnapshot(saidasRef, (snapshot) => {
  const lista = document.getElementById("listaSaidas");
  if (!lista) return;

  lista.innerHTML = "";

  snapshot.forEach((doc) => {
    const dados = doc.data();
    const item = document.createElement("li");
    item.innerText = `${dados.descricao} - R$ ${dados.valor}`;
    lista.appendChild(item);
  });
});
