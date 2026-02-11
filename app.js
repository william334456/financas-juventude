import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const docRef = doc(db, "metaRetiro", "dados");

getDoc(docRef).then((docSnap) => {
  if (docSnap.exists()) {

    const meta = docSnap.data().meta;
    const atual = docSnap.data().atual;

    document.getElementById("metaValor").innerText = meta;
    document.getElementById("valorAtual").innerText = atual;

    const porcentagem = (atual / meta) * 100;
    document.getElementById("progress").style.width = porcentagem + "%";
  }
});
