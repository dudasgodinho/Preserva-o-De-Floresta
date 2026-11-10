   "Sua missão é tomar decisões para recuperar esse lugar. Cada escolha muda a vida da floresta."
  ));
  const label = el("label", "", "Qual é o seu nome, explorador?");
  label.htmlFor = "nick";
  box.appendChild(label);
  const field = el("div", "field");
  const input = el("input");
  input.id = "nick";
  input.type = "text";
  input.maxLength = 22;
  input.placeholder = "Digite seu nome...";
  input.autocomplete = "given-name";
  input.value = nick;
  input.setAttribute("aria-describedby", "nickHint nickErr");
  field.appendChild(input);
  const btn = el("button", "btn", "Começar missão →");
  btn.type = "button";
  btn.addEventListener("click", () => iniciar(input.value));
  field.appendChild(btn);
  box.appendChild(field);
  box.appendChild(el("p", "hint", "Serão 9 decisões. Você começa com 50% de vida na floresta."));
  const err = el("p", "err");
  err.id = "nickErr";
  err.setAttribute("role", "alert");
  box.appendChild(err);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") iniciar(input.value);
  });
  $screen.replaceChildren(box);
  input.focus();
}

function iniciar(nome){
  const limpo = nome.trim().replace(/\s+/g, " ");
  if (!limpo){
    document.getElementById("nickErr").textContent = "Digite seu nome para começar.";
    document.getElementById("nick").focus();
    return;
  }
  nick = limpo.slice(0,22);
  try { localStorage.setItem("floresta_nick", nick); } catch(e) {}
  st = {
    nick,
    vida: VIDA_INICIAL,
    etapa: 0,
    respostas: [],
    perguntas: QUIZ.map(q => ({...q, opcoes: shuffle(q.opcoes)})),
    fim: false
  };
  drawRail();
  telaPergunta();
}

/* ============ PERGUNTAS ============ */
function telaPergunta(){
  if (!st || st.fim) return;
  drawRail();
  const q = st.perguntas[st.etapa];
  const box = el("div", "");
  box.appendChild(el("p", "kicker", `Decisão ${st.etapa + 1} de ${QUIZ.length} · ${q.tema}`));
  const h = el("h2", "serif", q.texto);
  h.tabIndex = -1;
  box.appendChild(h);
  box.appendChild(el("p", "hint", "Escolha a atitude que mais ajuda a floresta."));
  const opts = el("div", "opts");
  q.opcoes.forEach((op, i) => {
    const b = el("button", "opt");
    b.type = "button";
    b.appendChild(el("span", "k", LETRAS[i]));
    b.appendChild(el("span", "", op.t));
    b.appendChild(el("span", "mark", ""));
    b.addEventListener("click", () => responder(i));
    opts.appendChild(b);
  });
  box.appendChild(opts);
  $screen.replaceChildren(box);
  h.focus();
}

function responder(indice){
  if (!st || st.fim || st.respostas[st.etapa]) return;
  const q = st.perguntas[st.etapa];
  const escolhida = q.opcoes[indice];
  const certa = escolhida.ok;
  st.vida = Math.max(0, Math.min(100, st.vida + (certa ? GANHO : -PERDA)));
  st.respostas[st.etapa] = {certa, texto: escolhida.t};
  drawRail();

  const botoes = [...$screen.querySelectorAll(".opt")];
  botoes.forEach((b, i) => {
    b.disabled = true;
    const op = q.opcoes[i];
    if (op.ok){
      b.classList.add("ok");
      b.querySelector(".mark").textContent = "✓";
    } else if (i === indice){
      b.classList.add("no");
      b.querySelector(".mark").textContent = "×";
    } else {
      b.classList.add("dim");
    }
  });

  const box = el("div", "fb" + (certa ? "" : " bad"));
  box.appendChild(el("h3", "", certa ? "Boa escolha! +15% de vida" : "Não foi a melhor escolha. −20% de vida"));
  box.appendChild(el("p", "", certa ? q.boa : q.ruim));
  const proximo = el("button", "btn", st.vida === 0 ? "Ver resultado" :
    (st.etapa === QUIZ.length - 1 ? "Finalizar missão →" : "Próxima decisão →"));
  proximo.type = "button";
  proximo.addEventListener("click", avancar);
  box.appendChild(proximo);
  $screen.appendChild(box);
  proximo.focus();
}

function avancar(){
  if (!st || st.fim) return;
  if (st.vida === 0 || st.etapa === QUIZ.length - 1){
    finalizar();
    return;
  }
  st.etapa++;
  telaPergunta();
}

/* ============ RESULTADO ============ */
function finalizar(){
  st.fim = true;
  drawRail();
  const acertos = st.respostas.filter(r => r.certa).length;
  const venceu = st.vida >= 100;
  const box = el("div", "");
  box.appendChild(el("p", "kicker", "Missão concluída"));
  box.appendChild(el("h2", "serif big " + (venceu ? "win" : "lose"),
    venceu ? "Floresta restaurada!" : (st.vida === 0 ? "Game over" : "A floresta precisa de você")));
  box.appendChild(el("p", "lead",
    venceu
      ? `Parabéns, ${st.nick}! Suas escolhas ajudaram a devolver a vida à floresta.`
      : `Você terminou com ${st.vida}% de vida. Continue aprendendo para proteger a floresta!`
  ));
  const score = el("div", "score");
  score.appendChild(el("b", st.vida < 30 ? "lose" : "", st.vida + "%"));
  score.appendChild(el("span", "", "de vida da floresta"));
  box.appendChild(score);
  const bar = el("div", "bar");
  const fill = el("i", st.vida <= 30 ? "low" : "");
  fill.style.width = st.vida + "%";
  bar.appendChild(fill);
  box.appendChild(bar);
  box.appendChild(el("p", "rule", `${acertos} de ${QUIZ.length} respostas corretas · Você precisa chegar a 100% para vencer.`));

  const h = el("h3", "", "Resumo das decisões");
  h.style.marginTop = "28px";
  box.appendChild(h);
  const review = el("ol", "review");
  st.respostas.forEach((r, i) => {
    const li = el("li");
    li.appendChild(el("span", "m " + (r.certa ? "ok" : "no"), r.certa ? "✓" : "×"));
    const content = el("div", "");
    content.appendChild(el("strong", "", QUIZ[i].tema));
    content.appendChild(el("small", "", r.texto));
    li.appendChild(content);
    review.appendChild(li);
  });
  box.appendChild(review);

  const btn = el("button", "btn", "Jogar novamente ↻");
  btn.type = "button";
  btn.addEventListener("click", telaInicio);
  box.appendChild(btn);
  $screen.replaceChildren(box);
  box.querySelector("button").focus();
}

telaInicio();
</script>
</body>
</html>