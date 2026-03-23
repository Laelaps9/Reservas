import { seleccionarFecha } from '../utils/fechas'

export default defineEventHandler(async (event) => {
  const { fechaId, clientId } = await readBody(event)

  await seleccionarFecha(fechaId, clientId)

  return { success: true }
})
