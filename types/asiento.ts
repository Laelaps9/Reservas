export type AsientoEstado = 'disponible' | 'en_proceso' | 'reservado'

export interface Asiento {
  id: number,
  estado: AsientoEstado,
  expira: string | null
}
