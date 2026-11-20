import type { Estado, ResumenDia, Toma } from "./types.js";

export const GRAMOS_POR_SCOOP = 5;
const CLAVE = "dosis-estado-v1";

const porDefecto: Estado = { tomas: [], reservaInicial: 500, metaDiaria: 2 };

export function cargar(): Estado {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return { ...porDefecto, tomas: [] };
    return { ...porDefecto, ...(JSON.parse(raw) as Partial<Estado>) };
  } catch {
    return { ...porDefecto, tomas: [] };
  }
}

export function guardar(e: Estado): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(e));
  } catch {
    /* sin almacenamiento: la app sigue funcionando en memoria */
  }
}

export function claveDia(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function registrar(e: Estado): Toma {
  const toma: Toma = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    fecha: new Date().toISOString(),
    gramos: GRAMOS_POR_SCOOP,
  };
  e.tomas.push(toma);
  guardar(e);
  return toma;
}

export function deshacer(e: Estado, id: string): void {
  e.tomas = e.tomas.filter((t) => t.id !== id);
  guardar(e);
}

export function tomasDeHoy(e: Estado): Toma[] {
  const hoy = claveDia(new Date());
  return e.tomas.filter((t) => claveDia(new Date(t.fecha)) === hoy);
}

export function gramosRestantes(e: Estado): number {
  const usados = e.tomas.reduce((suma, t) => suma + t.gramos, 0);
  return Math.max(0, e.reservaInicial - usados);
}

export function historialPorDia(e: Estado): ResumenDia[] {
  const mapa = new Map<string, Toma[]>();
  for (const t of e.tomas) {
    const dia = claveDia(new Date(t.fecha));
    mapa.set(dia, [...(mapa.get(dia) ?? []), t]);
  }
  return [...mapa.entries()]
    .map(([dia, tomas]) => ({
      dia,
      tomas,
      gramos: tomas.reduce((s, t) => s + t.gramos, 0),
    }))
    .sort((a, b) => (a.dia < b.dia ? 1 : -1));
}

export function fijarReserva(e: Estado, reserva: number, meta: number): void {
  e.reservaInicial = reserva;
  e.metaDiaria = meta;
  e.tomas = []; // nuevo pote: se reinicia el conteo
  guardar(e);
}
