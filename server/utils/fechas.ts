import type { RowDataPacket } from 'mysql2'
import { db } from './db'
import type { Fecha } from '../../types/fecha'

interface FechaRow extends RowDataPacket {
  id: number,
  fecha: Date,
  estado: Fecha['estado'],
  ocupado_por: string | null
}

export async function getFechas(): Promise<Fecha[]> {
  const [rows] = await db.query<FechaRow[]>(`
      SELECT id,
        fecha,
        estado,
        ocupado_por
      FROM fechas
    `)

  return rows
}

export async function procesarFecha(fechaId: number, clientId: string): Promise<void> {
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query<FechaRow[]>(
      `SELECT * FROM fechas WHERE id = ? FOR UPDATE`,
      [fechaId]
    )

    const fecha = rows[0]

    if(!fecha) {
      throw createError({ statusCode: 404, statusMessage: 'Fecha no encontrada' })
    }

    const isEnProceso = fecha.estado === 'en_proceso'

    if (fecha.estado === 'reservada' || isEnProceso) {
      throw createError({ statusCode: 409, statusMessage: 'Fecha no disponible' })
    }

    await conn.query(
      `UPDATE fechas
       SET estado = 'en_proceso', ocupado_por = ?  WHERE id = ?`,
       [clientId, fechaId]
    )

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function confirmarFecha(fechaId: number, clientId: string): Promise<void> {
  const [result]: any = await db.query(
    `UPDATE fechas
     SET estado = 'reservada', ocupado_por = NULL
     WHERE id = ?
     AND estado = 'en_proceso'
     AND ocupado_por = ?`,
     [fechaId, clientId]
  )

  if(result.affectedRows === 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No se pudo confirmar la fecha'
    })
  }
}
