export interface Toma {
  id: string;
  fecha: string; // ISO
  gramos: number;
}

export interface Estado {
  tomas: Toma[];
  reservaInicial: number; // gramos del pote al empezar
  metaDiaria: number; // scoops por día
}

export interface ResumenDia {
  dia: string; // AAAA-MM-DD (hora local)
  tomas: Toma[];
  gramos: number;
}

export type Pantalla = "inicio" | "historial" | "reserva";
