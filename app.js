import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

const docRef = doc(db, "financeiro", "resumo");

onSnapshot(docRef, (docSnap) => {
  if (docSnap.exists()) {
    const dados = docSnap.data();

    const meta = dados.meta || 0;
    const arrecadado = dados.arrecadado || 0;

    document.getElementById("metaValor").innerText = meta;
    document.getElementById("valorAtual").innerText = arrecadado;

    const porcentagem = (arrecadado / meta) * 100;
    document.getElementById("barraProgresso").style.width = porcentagem + "%";
  }
});
