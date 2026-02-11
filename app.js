// 🔥 Firebase v10 Modular

import { 
  doc, 
  getDoc, 
  getDocs, 
  collection 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

// =============================
// 🔹 CARREGAR META
// =============================
async function carregarMeta() {
  const docRef = doc(db, "metaRetiro", "dados");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const dados = docSnap.data();

    const meta = dados.meta || 0;
    const atual = dados.atual || 0;

    document.getElementById("metaValor").innerText = meta;
    document.getElementById("arrecadadoValor").innerText = atual;

    const porcentagem = meta > 0 ? (atual / meta) * 100 : 0;
    document.getElementById("barraProgresso").style.width = porcentagem + "%";
  }
}

// =============================
// 🔹 CARREGAR SAÍDAS
// =============================
async function carregarSaidas() {
  const querySnapshot = await getDocs(collection(db, "saidas"));
  const lista = document.getElementById("listaSaidas");

  if (!lista) return;

  lista.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const dados = doc.data();

    const item = document.createElement("li");
    item.innerText = `${dados.descricao} - R$ ${dados.valor}`;

    lista.appendChild(item);
  });
}

// =============================
// 🚀 INICIALIZA
// =============================
carregarMeta();
carregarSaidas();
