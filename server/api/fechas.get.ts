import { getFechas } from '../utils/fechas'

export default defineEventHandler(async () => {
  return await getFechas()
})
