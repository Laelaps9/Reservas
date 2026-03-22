import type { RowDataPacket } from 'mysql2'
import { db } from './db'
import type { Asiento } from '../../types/asiento'

interface AsientoRow extends RowDataPacket {
  id: number,
  estado: Asiento['estado'],
  expira: string | null
}

export async function getAsientos(): Promise<Asiento[]> {
  const [rows] = await db.query<AsientoRow[]>(`
      SELECT id,
        CASE
          WHEN estado = 'en_proceso' AND expira < NOW() THEN 'disponible'
          ELSE estado
        END as estado,
        expira
      FROM asientos
    `)

  return rows
}

export async function procesarAsiento(asientoId: number): Promise<void> {
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query<AsientoRow[]>(
      `SELECT * FROM asientos WHERE id = ? FOR UPDATE`,
      [asientoId]
    )

    const asiento = rows[0]

    if(!asiento) {
      throw createError({ statusCode: 404, statusMessage: 'Asiento no encontrado' })
    }

    const isEnProceso =
      asiento.estado === 'en_proceso' &&
      asiento.expira !== null &&
      new Date(asiento.expira) > new Date()

    if (asiento.estado === 'reservado' || isEnProceso) {
      throw createError({ statusCode: 409, statusMessage: 'Asiento no disponible' })
    }

    await conn.query(
      `UPDATE asientos
       SET estado = 'en_proceso',
         expira = NOW() + INTERVAL 1 MINUTE
       WHERE id = ?`,
       [asientoId]
    )

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function confirmAsiento(asientoId: number): Promise<void> {
  const [result] = await db.query(
    `UPDATE asientos
     SET estado = 'reservado', expira = NULL
     WHERE id = ?
     AND estado = 'en_proceso'
     AND expira > NOW()`,
     [asientoId]
  )
}
