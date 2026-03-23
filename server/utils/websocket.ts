import { WebSocketServer, WebSocket } from 'ws'

export type FechaEstado = 'disponible' | 'en_proceso' | 'reservada'

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

    socket.on('close', () => {
      console.log('Client disconnected')
    })
  })

  console.log(`WebSocket server running on ws://localhost:${port}`)

  return wss
}

export function broadcast(message: FechaUpdateMessage): void {
  if (!wss) return

  const data = JSON.stringify(message)

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}
