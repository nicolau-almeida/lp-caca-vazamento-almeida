"use strict";

const WHATSAPP = "https://wa.me/5511940058415";

// avisa o <head> que o script carregou; sem isso ele desliga as animações de entrada
window.almeidaPronto = true;

// Entrada das partes de cada seção: uma vez, e nunca deixa conteúdo escondido.
(() => {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;
  const show = (el) => el.classList.add("is-in");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(show);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      show(entry.target);
      io.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
  targets.forEach((el) => io.observe(el));
  window.addEventListener("load", () => setTimeout(() => {
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) show(el);
    });
  }, 2500));
})();

// Um botão principal por vez: enquanto o do hero está na tela, o do cabeçalho fica escondido.
(() => {
  const root = document.documentElement;
  const heroCta = document.querySelector(".hero__cta");
  const headerCta = document.querySelector(".header .button");
  if (!heroCta || !headerCta || !("IntersectionObserver" in window)) {
    root.classList.remove("at-hero");
    return;
  }
  // inert tira o botão escondido do teclado e do leitor de tela;
  // a margem negativa conta o botão do hero como fora da tela quando passa por baixo do cabeçalho
  const header = document.querySelector(".header");
  new IntersectionObserver(([entry]) => {
    root.classList.toggle("at-hero", entry.isIntersecting);
    headerCta.inert = entry.isIntersecting;
  }, { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` }).observe(heroCta);
})();

// Menu do celular: abre por cima da página, fecha com Esc, com um link ou ao alargar a tela.
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu");
  if (!toggle || !menu) return;
  const root = document.documentElement;
  const behind = [document.querySelector("main"), document.querySelector("footer")];
  const wide = window.matchMedia("(min-width: 60em)");
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const headerCta = document.querySelector(".header .button");
  let hideTimer = 0;

  const setOpen = (open, restoreFocus = false) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    clearTimeout(hideTimer);
    if (open) {
      // sai do display: none, e só no quadro seguinte começa o fade
      menu.hidden = false;
      void menu.offsetHeight;
      menu.classList.add("is-open");
    } else {
      menu.classList.remove("is-open");
      hideTimer = setTimeout(() => { menu.hidden = true; }, 220);
    }
    menu.inert = !open;
    headerCta.inert = open || root.classList.contains("at-hero");
    // com o menu aberto, a página atrás não recebe foco nem rola
    behind.forEach((el) => { el.inert = open; });
    root.classList.toggle("menu-open", open);
    if (open) menu.querySelector("a").focus({ preventScroll: true });
    else if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) setOpen(false, true);
  });
  wide.addEventListener("change", () => {
    if (wide.matches && isOpen()) setOpen(false);
  });
})();

// Sinais marcados viram a mensagem do WhatsApp.
(() => {
  const form = document.getElementById("orcamento");
  if (!form) return;
  const preview = document.getElementById("mensagem");
  const field = document.getElementById("mensagem-campo");
  const links = document.querySelectorAll("[data-wa]");

  const compose = () => {
    const signs = [...form.querySelectorAll('input[type="checkbox"]:checked')].map((el) => el.value);
    const place = form.querySelector('input[name="local"]:checked').value;
    const intro = signs.length
      ? `Olá! Preciso de orçamento para vazamento. Sinais: ${signs.join("; ")}.`
      : "Olá! Preciso de orçamento para caça vazamento.";
    return `${intro} Local: ${place}.`;
  };

  const update = () => {
    const message = compose();
    const url = `${WHATSAPP}?text=${encodeURIComponent(message)}`;
    preview.textContent = message;
    field.value = message;
    links.forEach((a) => { a.href = url; });
  };

  form.addEventListener("change", update);
  update();
})();

// Caça ao vazamento: cada toque é uma leitura do geofone; o sinal cresce perto do cano.
(() => {
  const floor = document.getElementById("hunt-floor");
  if (!floor) return;
  const COLS = 6;
  const ROWS = 6;
  const num = document.getElementById("hunt-num");
  const bars = [...document.getElementById("hunt-meter").children];
  const status = document.getElementById("hunt-status");
  const cta = document.getElementById("hunt-cta");
  const reset = document.getElementById("hunt-reset");
  const maxDist = Math.hypot(COLS - 1, ROWS - 1);
  const tiles = [];
  let leak = null;
  let taps = 0;
  let focusIndex = 0;

  const rove = (index) => {
    tiles[focusIndex].el.tabIndex = -1;
    focusIndex = index;
    tiles[focusIndex].el.tabIndex = 0;
  };

  const label = (tile) => `Piso da linha ${tile.row + 1}, coluna ${tile.col + 1}`;

  const setSignal = (pct) => {
    num.textContent = `${pct}%`;
    const lit = Math.round((pct / 100) * bars.length);
    bars.forEach((bar, i) => bar.classList.toggle("is-on", i < lit));
  };

  const start = () => {
    leak = { col: Math.floor(Math.random() * COLS), row: Math.floor(Math.random() * ROWS) };
    taps = 0;
    rove(0);
    tiles.forEach((tile) => {
      tile.el.disabled = false;
      tile.el.classList.remove("is-current", "is-found");
      tile.el.style.removeProperty("--s");
      tile.el.setAttribute("aria-label", label(tile));
    });
    setSignal(0);
    status.textContent = "Nenhum toque ainda.";
    cta.hidden = true;
    reset.hidden = true;
  };

  const read = (tile) => {
    taps += 1;
    tiles.forEach((other) => other.el.classList.remove("is-current"));
    const dist = Math.hypot(tile.col - leak.col, tile.row - leak.row);

    if (dist === 0) {
      tile.el.classList.add("is-found");
      tile.el.setAttribute("aria-label", `${label(tile)}, vazamento encontrado`);
      tiles.forEach((other) => { other.el.disabled = true; });
      setSignal(100);
      const count = taps === 1 ? "no primeiro toque" : `em ${taps} toques`;
      status.textContent = `Achou ${count}. O Almeida faz isso de verdade, com o geofone, antes de quebrar qualquer piso.`;
      cta.hidden = false;
      reset.hidden = false;
      reset.focus({ preventScroll: true });
      return;
    }

    const strength = 1 - dist / maxDist;
    const pct = Math.round(strength * 100);
    tile.el.classList.add("is-current");
    tile.el.style.setProperty("--s", (0.12 + 0.88 * strength * strength).toFixed(2));
    tile.el.setAttribute("aria-label", `${label(tile)}, sinal ${pct}%`);
    setSignal(pct);
    if (pct >= 80) status.textContent = "Sinal forte. Está ao lado.";
    else if (pct >= 60) status.textContent = "Sinal médio. Chegando perto.";
    else status.textContent = "Sinal fraco. Longe do vazamento.";
  };

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "tile";
      el.tabIndex = -1;
      const tile = { el, col, row };
      const index = tiles.length;
      el.addEventListener("click", () => {
        rove(index);
        read(tile);
      });
      floor.append(el);
      tiles.push(tile);
    }
  }

  const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLS, ArrowUp: -COLS };
  floor.addEventListener("keydown", (event) => {
    const step = moves[event.key];
    if (step === undefined) return;
    const col = focusIndex % COLS;
    if ((step === 1 && col === COLS - 1) || (step === -1 && col === 0)) return;
    const next = focusIndex + step;
    if (next < 0 || next >= tiles.length) return;
    event.preventDefault();
    rove(next);
    tiles[next].el.focus();
  });

  reset.addEventListener("click", () => {
    start();
    tiles[0].el.focus({ preventScroll: true });
  });
  start();
})();

// Vitrine de serviços: no desktop, o nome escolhido troca a foto ao lado.
(() => {
  const items = [...document.querySelectorAll("#vitrine .svc")];
  if (!items.length) return;
  const wide = window.matchMedia("(min-width: 60em)");
  const hover = window.matchMedia("(hover: hover) and (pointer: fine)");

  // no celular todas as cartelas ficam visíveis e o nome não é um controle;
  // no desktop só o painel escolhido aparece e o leitor de tela ignora os outros
  const sync = () => {
    items.forEach((item) => {
      const on = item.classList.contains("is-active");
      const tab = item.querySelector(".svc__tab");
      const panel = item.querySelector(".svc__panel");
      if (wide.matches) {
        tab.tabIndex = 0;
        tab.setAttribute("aria-expanded", String(on));
        panel.setAttribute("aria-hidden", String(!on));
      } else {
        tab.tabIndex = -1;
        tab.removeAttribute("aria-expanded");
        panel.removeAttribute("aria-hidden");
      }
    });
  };

  const activate = (item) => {
    items.forEach((other) => other.classList.toggle("is-active", other === item));
    sync();
  };

  wide.addEventListener("change", sync);
  sync();

  items.forEach((item) => {
    const tab = item.querySelector(".svc__tab");
    tab.addEventListener("click", () => activate(item));
    tab.addEventListener("focus", () => activate(item));
    tab.addEventListener("mouseenter", () => {
      if (wide.matches && hover.matches) activate(item);
    });
  });
})();
