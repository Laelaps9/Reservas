import { cancelarFecha } from '../utils/fechas'

export default defineEventHandler(async (event) => {
  const { fechaId } = await readBody(event)

  await cancelarFecha(fechaId)

  return { success: true }
})
