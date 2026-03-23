import { WebSocketServer, WebSocket } from 'ws'
import { liberar } from './fechas'

export type FechaEstado = 'disponible' | 'en_proceso' | 'reservada'

type InitMessage = {
  type: 'init',
  clientId: string
}

export interface FechaUpdateMessage {
  type: 'fecha_update',
  fechaId: number,
  estado: FechaEstado,
  ocupado_por: string | null
}

let wss: WebSocketServer | null = null

export function initWebSocketServer(port = 3001): WebSocketServer {
  if (wss) return wss

  wss = new WebSocketServer({ port })

  wss.on('connection', (socket: WebSocket) => {
    console.log('Client connected')
    let clientId: string | null = null

    socket.on('message', (message) => {
      const data = JSON.parse(message.toString()) as InitMessage
      try {
        const data = JSON.parse(message.toString()) as InitMessage

        if (data.type === 'init' && data.clientId) {
          clientId = data.clientId
        }
      } catch (err) {
        console.error('Invalid WS message', err)
      }
    })

    socket.on('close', async () => {
      if (!clientId) return

      const releasedIds = await liberar(clientId)
      for (const id of releasedIds) {
        broadcast({
          type: 'fecha_update',
          fechaId: id,
          estado: 'disponible',
          ocupado_por: null
        })
      }

      console.log(`Client disconnected: ${clientId}`)
    })
  })

  console.log(`WebSocket server running on ws://localhost:${port}`)

  return wss
}

export function broadcast(message: FechaUpdateMessage): void {
  if (!wss) {
    console.warn('WebSocket server not initialized')
    return
  }

  const data = JSON.stringify(message)

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}
