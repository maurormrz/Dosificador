import {
  GRAMOS_POR_SCOOP,
  cargar,
  deshacer,
  fijarReserva,
  gramosRestantes,
  historialPorDia,
  registrar,
  tomasDeHoy,
} from "./store.js";
import type { Pantalla } from "./types.js";

const app = document.getElementById("app") as HTMLElement;
let estado = cargar();
let pantalla: Pantalla = "inicio";
let ultimaToma: string | null = null;
let animar = false;
let temporizador: number | undefined;

const ICONO_SCOOP = `
<svg class="scoop" viewBox="0 0 120 60" aria-hidden="true">
  <rect x="48" y="26" width="68" height="8" rx="4" class="mango"/>
  <path d="M6 22h52v8a26 26 0 0 1-52 0z" class="cuenco"/>
  <path d="M10 22h44v6a22 22 0 0 1-44 0z" class="polvo"/>
</svg>`;

function formatoDia(clave: string): string {
  return new Date(`${clave}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatoHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function vistaInicio(): string {
  const n = tomasDeHoy(estado).length;
  const meta = estado.metaDiaria;
  const progreso = Math.min(1, n / meta);
  const C = 2 * Math.PI * 70;
  const restante = gramosRestantes(estado);
  const aviso =
    restante <= 50
      ? `<p class="aviso">Quedan pocos gramos en el pote: ${restante} g</p>`
      : "";
  const toast = ultimaToma
    ? `<div class="toast" role="status">
         <span>+${GRAMOS_POR_SCOOP} g registrados</span>
         <button data-accion="deshacer">Deshacer</button>
       </div>`
    : "";

  return `
    <header><h1>Dosis</h1><p>Medir sin pensar</p></header>
    <section class="anillo ${animar ? "pulso" : ""}">
      <svg viewBox="0 0 180 180" role="img" aria-label="${n} de ${meta} scoops hoy">
        <circle cx="90" cy="90" r="70" class="pista"/>
        <circle cx="90" cy="90" r="70" class="avance"
          stroke-dasharray="${C.toFixed(1)}"
          stroke-dashoffset="${(C * (1 - progreso)).toFixed(1)}"
          transform="rotate(-90 90 90)"/>
      </svg>
      <div class="centro">
        <strong>${n} / ${meta}</strong>
        <span>scoops hoy</span>
      </div>
    </section>
    <div class="${animar ? "llenando" : ""}">${ICONO_SCOOP}</div>
    ${aviso}
    <button class="principal" data-accion="registrar">Registrar scoop (+${GRAMOS_POR_SCOOP} g)</button>
    ${toast}`;
}

function vistaHistorial(): string {
  const dias = historialPorDia(estado);
  if (dias.length === 0) {
    return `<header><h1>Historial</h1></header><p class="vacio">Todavía no registraste ninguna toma.</p>`;
  }
  const lista = dias
    .map(
      (d) => `
      <li>
        <div class="fila"><strong>${formatoDia(d.dia)}</strong><span>${d.tomas.length} scoops · ${d.gramos} g</span></div>
        <small>${d.tomas
          .map((t) => formatoHora(t.fecha))
          .reverse()
          .join(" · ")}</small>
      </li>`,
    )
    .join("");
  return `<header><h1>Historial</h1></header><ul class="historial">${lista}</ul>`;
}

function vistaReserva(): string {
  const restante = gramosRestantes(estado);
  const pct =
    estado.reservaInicial > 0
      ? Math.round((restante / estado.reservaInicial) * 100)
      : 0;
  const scoops = Math.floor(restante / GRAMOS_POR_SCOOP);
  return `
    <header><h1>Reserva</h1></header>
    <p class="gramos">${restante} <small>g</small></p>
    <div class="barra" role="img" aria-label="${pct}% del pote"><span style="width:${pct}%"></span></div>
    <p class="detalle">Alcanza para ${scoops} scoops (${pct}% del pote)</p>
    <form class="ajustes" data-form="reserva">
      <label>Peso del pote nuevo (g)
        <input id="reserva" type="number" min="10" step="10" value="${estado.reservaInicial}" required>
      </label>
      <label>Scoops por día
        <input id="meta" type="number" min="1" max="10" value="${estado.metaDiaria}" required>
      </label>
      <button class="secundario" type="submit">Guardar y reiniciar pote</button>
    </form>`;
}

function barra(): string {
  const items: [Pantalla, string][] = [
    ["inicio", "Inicio"],
    ["historial", "Historial"],
    ["reserva", "Reserva"],
  ];
  return `<nav>${items
    .map(
      ([p, texto]) =>
        `<button data-accion="ir" data-destino="${p}" ${p === pantalla ? 'aria-current="page"' : ""}>${texto}</button>`,
    )
    .join("")}</nav>`;
}

function render(): void {
  const vista =
    pantalla === "inicio"
      ? vistaInicio()
      : pantalla === "historial"
        ? vistaHistorial()
        : vistaReserva();
  app.innerHTML = `<main class="pantalla">${vista}</main>${barra()}`;
  animar = false;
}

app.addEventListener("click", (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>("[data-accion]");
  if (!el) return;

  switch (el.dataset.accion) {
    case "ir":
      pantalla = el.dataset.destino as Pantalla;
      render();
      break;
    case "registrar": {
      ultimaToma = registrar(estado).id;
      animar = true;
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => {
        ultimaToma = null;
        if (pantalla === "inicio") render();
      }, 6000);
      render();
      break;
    }
    case "deshacer":
      if (ultimaToma) deshacer(estado, ultimaToma);
      ultimaToma = null;
      window.clearTimeout(temporizador);
      render();
      break;
  }
});

app.addEventListener("submit", (ev) => {
  const form = ev.target as HTMLFormElement;
  if (form.dataset.form !== "reserva") return;
  ev.preventDefault();
  const reserva = Number(
    (document.getElementById("reserva") as HTMLInputElement).value,
  );
  const meta = Number(
    (document.getElementById("meta") as HTMLInputElement).value,
  );
  if (reserva > 0 && meta > 0) {
    fijarReserva(estado, reserva, meta);
    ultimaToma = null;
    pantalla = "inicio";
    render();
  }
});

render();
