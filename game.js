/* ================================================================
   MISSÃO: DEVOLVER A HARMONIA À FLORESTA
   Cada cena = 1 slide do Canva (imagens/slideN.png).
   x, y, largura, altura = porcentagem do slide (0 a 100).
   destino = número da cena para onde o botão leva.
   Para ajustar as posições, aperte a tecla D (modo de teste).
   ================================================================ */

// Posições padrão (chute inicial). Ajuste depois no modo de teste.
const BOM  = { x: 8,  y: 68, largura: 38, altura: 20 }; // botão da esquerda
const MAU  = { x: 54, y: 68, largura: 38, altura: 20 }; // botão da direita
const REINICIAR = { x: 35, y: 78, largura: 30, altura: 14 }; // jogar de novo

const cenas = {
  // LAYOUT 1 — O INÍCIO
  1: {
    imagem: "imagens/slide1.png",
    botoes: [
      { ...BOM, destino: 2, nome: "Fazer o bem: recolher o lixo" },
      { ...MAU, destino: 3, nome: "Fazer o mal: jogar mais lixo" }
    ]
  },
  // LAYOUT 2 — O LIXO
  2: {
    imagem: "imagens/slide2.png",
    botoes: [
      { ...BOM, destino: 4, nome: "Fazer o bem: cuidar da árvore" },
      { ...MAU, destino: 5, nome: "Fazer o mal: quebrar a árvore" }
    ]
  },
  // LAYOUT 3 — A FLORESTA ABANDONADA
  3: {
    imagem: "imagens/slide3.png",
    botoes: [
      { ...BOM, destino: 6, nome: "Fazer o bem: colocar água para o animal" },
      { ...MAU, destino: 5, nome: "Fazer o mal: espantar o animal" }
    ]
  },
  // LAYOUT 4 — A NOVA VIDA
  4: {
    imagem: "imagens/slide4.png",
    botoes: [
      { ...BOM, destino: 6, nome: "Fazer o bem: plantar novas árvores" },
      { ...MAU, destino: 5, nome: "Fazer o mal: cortar outras árvores" }
    ]
  },
  // LAYOUT 5 — A DESTRUIÇÃO
  5: {
    imagem: "imagens/slide5.png",
    botoes: [
      { ...BOM, destino: 6, nome: "Fazer o bem: recuperar a floresta" },
      { ...MAU, destino: 7, nome: "Fazer o mal: continuar destruindo" }
    ]
  },
  // LAYOUT 6 — OS ANIMAIS RETORNAM
  6: {
    imagem: "imagens/slide6.png",
    botoes: [
      { ...BOM, destino: 8, nome: "Fazer o bem: apagar a fogueira" },
      { ...MAU, destino: 7, nome: "Fazer o mal: deixar a fogueira acesa" }
    ]
  },
  // LAYOUT 7 — GAME OVER
  7: {
    imagem: "imagens/slide7.png",
    botoes: [
      { ...REINICIAR, destino: 1, nome: "Jogar de novo" }
    ]
  },
  // LAYOUT 8 — A FLORESTA EM HARMONIA (YOU WIN)
  8: {
    imagem: "imagens/slide8.png",
    botoes: [
      { ...REINICIAR, destino: 1, nome: "Jogar de novo" }
    ]
  }
};

/* ---------------- motor do jogo (não precisa mexer) ---------------- */

const jogo = document.getElementById("jogo");
const fundo = document.getElementById("fundo");
const areaBotoes = document.getElementById("botoes");
const medidor = document.getElementById("medidor");
let cenaAtual = 1;

// carrega todas as imagens antes, para a troca ser instantânea
Object.values(cenas).forEach(c => { new Image().src = c.imagem; });

function mostrarCena(numero) {
  const cena = cenas[numero];
  if (!cena) return console.error("Cena não existe:", numero);
  cenaAtual = numero;

  jogo.classList.add("trocando");
  setTimeout(() => {
    fundo.src = cena.imagem;
    fundo.alt = "Cena " + numero;
    areaBotoes.innerHTML = "";

    cena.botoes.forEach(b => {
      const el = document.createElement("button");
      el.className = "area";
      el.setAttribute("aria-label", b.nome);
      el.style.left = b.x + "%";
      el.style.top = b.y + "%";
      el.style.width = b.largura + "%";
      el.style.height = b.altura + "%";
      el.addEventListener("click", () => mostrarCena(b.destino));
      areaBotoes.appendChild(el);
    });

    jogo.classList.remove("trocando");
  }, 200);
}

/* ---------------- modo de teste (tecla D) ----------------
   Aperte D, depois arraste o mouse sobre o botão desenhado no Canva.
   Os valores x, y, largura e altura aparecem embaixo (e no console F12).
   Copie para o botão certo no game.js. Aperte D de novo para sair. */

let inicio = null, caixa = null;

document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() !== "d") return;
  const ligado = jogo.classList.toggle("debug");
  medidor.hidden = !ligado;
  medidor.textContent = "Modo de teste: arraste sobre um botão";
});

const pct = (ev) => {
  const r = jogo.getBoundingClientRect();
  return {
    x: Math.min(100, Math.max(0, (ev.clientX - r.left) / r.width * 100)),
    y: Math.min(100, Math.max(0, (ev.clientY - r.top) / r.height * 100))
  };
};

jogo.addEventListener("mousedown", ev => {
  if (!jogo.classList.contains("debug")) return;
  ev.preventDefault();
  inicio = pct(ev);
  caixa = document.createElement("div");
  caixa.id = "caixa";
  jogo.appendChild(caixa);
});

window.addEventListener("mousemove", ev => {
  if (!inicio) return;
  const p = pct(ev);
  caixa.style.left = Math.min(inicio.x, p.x) + "%";
  caixa.style.top = Math.min(inicio.y, p.y) + "%";
  caixa.style.width = Math.abs(p.x - inicio.x) + "%";
  caixa.style.height = Math.abs(p.y - inicio.y) + "%";
});

window.addEventListener("mouseup", ev => {
  if (!inicio) return;
  const p = pct(ev);
  const r = n => Math.round(n * 10) / 10;
  const texto = `x: ${r(Math.min(inicio.x, p.x))}, y: ${r(Math.min(inicio.y, p.y))}, ` +
                `largura: ${r(Math.abs(p.x - inicio.x))}, altura: ${r(Math.abs(p.y - inicio.y))}`;
  medidor.textContent = texto;
  console.log(texto);
  inicio = null;
});

mostrarCena(1);
