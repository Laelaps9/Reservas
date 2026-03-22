import { confirmarAsiento } from '../utils/asientos'
import { broadcast } from '../utils/websocket'

export default defineEventHandler(async (event) => {
  const { asientoId } = await readBody<{ asientoId: number }>(event)

  await confirmarAsiento(asientoId)

  broadcast({
    type: 'asiento_update',
    asientoId,
    estado: 'ocupado',
  })

  return { success: true }
})
