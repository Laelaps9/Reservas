import { getAsientos } from '../utils/asientos'

export default defineEventHandler(async () => {
  return await getAsientos()
})
