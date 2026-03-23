import { confirmarFecha } from '../utils/fechas'

export default defineEventHandler(async (event) => {
  const { fechaId, clientId } = await readBody(event)

  await confirmarFecha(fechaId, clientId)

  return { success: true }
})
/*
import { confirmarFecha } from '../utils/fechas'
import { broadcast } from '../utils/websocket'

interface ConfirmarBody {
  fechaId: number,
  clientId: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ConfirmarBody>(event)

  if (!body?.fechaId || !body?.clientId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input'})
  }
  await confirmarFecha(body.fechaId, body.clientId)

  broadcast({
    type: 'fecha_update',
    fechaId: body.fechaId,
    estado: 'reservada',
    ocupado_por: null
  })

  return { success: true }
})
*/
