import { procesarAsiento } from '../../utils/asientos'

export default defineEventHandler(async (event) => {
  const { asientoId } = await readBody<{ asientoId: number }>(event)

  await procesarAsiento(asientoId)

  return { success: true }
})
