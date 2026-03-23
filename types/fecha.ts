export type FechaEstado = 'disponible' | 'en_proceso' | 'reservada'

export interface Fecha {
  id: number,
  estado: FechaEstado,
  fecha: Date,
  ocupado_por: string | null
}
