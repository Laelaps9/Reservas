import type { RowDataPacket } from 'mysql2'
import { db } from './db'
import type { Fecha } from '../../types/fecha'

interface FechaRow extends RowDataPacket {
  id: number,
  fecha: Date,
  estado: Fecha['estado'],
  ocupado_por: string | null
}

// Regresa todas las fechas en nuestra base de datos
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

// Cambia el estado de la fecha seleccionada a 'en_proceso'
export async function seleccionarFecha(fechaId: number, clientId: string): Promise<void> {
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Obtiene la fecha anteriormente seleccionada para después liberarla
    const [prevRows]: any = await conn.query(
      `SELECT id FROM fechas WHERE ocupado_por = ?`,
      [clientId]
    )

    if (prevRows.length > 0) {
      const prevId = prevRows[0].id

      await conn.query(
        `UPDATE fechas
         SET estado = 'disponible', ocupado_por = NULL
         WHERE id = ?`,
         [prevId]
      )

      broadcast({
        type: 'fecha_update',
        fechaId: prevId,
        estado: 'disponible',
        ocupado_por: null
      })
    }

    // Obtiene la nueva fecha seleccionada
    const [rows]: any = await conn.query(
      `SELECT * FROM fechas WHERE id = ? FOR UPDATE`,
      [fechaId]
    )

    const fecha = rows[0]

    if (!fecha) {
      throw createError({ statusCode: 404, statusMessage: 'Fecha no encontrada' })
    }

    if (fecha.estado !== 'disponible') {
      throw createError({ statusCode: 409, statusMessage: 'Fecha no disponible' })
    }

    await conn.query(
      `UPDATE fechas
       SET estado = 'en_proceso', ocupado_por = ?
       WHERE id = ?`,
       [clientId, fechaId]
    )

    await conn.commit()

    broadcast({
      type: 'fecha_update',
      fechaId,
      estado: 'en_proceso',
      ocupado_por: clientId
    })
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

// Confirma la fecha seleccionada por usuario con clientId
export async function confirmarFecha(fechaId: number, clientId: string): Promise<void> {
  const [result]: any = await db.query(
    `UPDATE fechas
     SET estado = 'reservada', ocupado_por = NULL
     WHERE id = ?
     AND estado = 'en_proceso'
     AND ocupado_por = ?`,
     [fechaId, clientId]
  )

  if (result.affectedRows === 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No se pudo confirmar fecha'
    })
  }

  broadcast({
    type: 'fecha_update',
    fechaId,
    estado: 'reservada',
    ocupado_por: null
  })
}

// Libera la fecha seleccionada por usuario con clientId
export async function liberarFechas(clientId: string): Promise<void> {
  const [rows]: any = await db.query(
    `SELECT id FROM fechas WHERE ocupado_por = ?`,
    [clientId]
  )

  if (rows.length === 0) return

  await db.query(
    `UPDATE fechas
     SET estado = 'disponible', ocupado_por = NULL
     WHERE ocupado_por = ?`,
     [clientId]
  )

  const ids = rows.map((r: any) => r.id)

  for (const id of ids) {
    broadcast({
      type: 'fecha_update',
      fechaId: id,
      estado: 'disponible',
      ocupado_por: null
    })
  }
}

// Libera las fechas que quedaron en estado 'en_proceso'
export async function limpiarFechasEnProceso(): Promise<void> {
  await db.query(`
      UPDATE fechas
      SET estado = 'disponible', ocupado_por = NULL
      WHERE estado = 'en_proceso'
    `)
}
