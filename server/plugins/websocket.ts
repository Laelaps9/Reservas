import { initWebSocketServer } from '../utils/websocket'

export default defineNitroPlugin(() => {
  initWebSocketServer(3001)
})
