import { confirmarFecha } from '../utils/fechas'

export default defineEventHandler(async (event) => {
  const { fechaId, clientId } = await readBody(event)

  await confirmarFecha(fechaId, clientId)

  return { success: true }
})
