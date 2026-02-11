let meta = 3000;
let arrecadado = 0;

function atualizarBarra() {
  const porcentagem = (arrecadado / meta) * 100;
  document.getElementById("barraProgresso").style.width = porcentagem + "%";
}

atualizarBarra();
