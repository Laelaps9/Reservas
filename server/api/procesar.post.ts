import { procesarFecha } from '../utils/fechas'
import { broadcast } from '../utils/websocket'

interface ProcesarBody {
  fechaId: number,
  clientId: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ProcesarBody>(event)

  if (!body?.fechaId || !body?.clientId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' })
  }

  await procesarFecha(body.fechaId, body.clientId)

  broadcast({
    type: 'fecha_update',
    fechaId: body.fechaId,
    estado: 'en_proceso',
    ocupado_por: body.clientId
  })

  return { success: true }
})
