import { procesarAsiento } from '../utils/asientos'
import { broadcast } from '../utils/websocket'

export default defineEventHandler(async (event) => {
  const { asientoId } = await readBody<{ asientoId: number }>(event)

  await procesarAsiento(asientoId)

  broadcast({
    type: 'asiento_update',
    asientoId,
    estado: 'en_proceso'
  })

  return { success: true }
})
