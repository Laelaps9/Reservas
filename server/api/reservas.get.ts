import { getFechasReservadas } from '../utils/fechas'

export default defineEventHandler(async () => {
	return await getFechasReservadas()
})
