import { WebSocketServer, WebSocket } from 'ws'
import { liberarFechas, limpiarFechasEnProceso } from './fechas'
import type { FechaEstado } from '../../types/fecha'

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

  // Al iniciar el servidor WS, limpia cualquier fecha que haya quedado en estado 'en_proceso'
  limpiarFechasEnProceso()

  wss = new WebSocketServer({ port })

  wss.on('connection', (socket: WebSocket) => {
    console.log('Cliente conectado')
    let clientId: string | null = null

    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString()) as InitMessage

        if (data.type === 'init' && data.clientId) {
          clientId = data.clientId
        }
      } catch (err) {
        console.error('Mensaje WS inválido', err)
      }
    })

    socket.on('close', async () => {
      if (!clientId) return

      // En caso de desconectarse, liberar fechas siendo procesadas por el usuario
      await liberarFechas(clientId)

      console.log(`Cliente desconectado: ${clientId}`)
    })
  })

  console.log(`Servidor WebSocket corriendo en ws://localhost:${port}`)

  return wss
}

export function broadcast(message: FechaUpdateMessage): void {
  if (!wss) {
    console.warn('Servidor WebSocket no inicializado')
    return
  }

  const data = JSON.stringify(message)

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}
