<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Fecha, FechaEstado } from '../../types/fecha'

const clientId = useState<string>('clientId', () => crypto.randomUUID())
const fechas = ref<Fecha[]>([])

const fetchFechas = async () => {
  fechas.value = await $fetch<Fecha[]>('/api/fechas')
}

onMounted(() => {
  fetchFechas()

  const ws = new WebSocket('ws://localhost:3001')

  ws.onmessage = (event: MessageEvent<string>) => {
    const data: {
      type: 'fecha_update',
      fechaId: number,
      estado: FechaEstado,
      ocupado_por: string,
    } = JSON.parse(event.data)

    const fecha = fechas.value.find((s) => s.id === data.fechaId)
    if (fecha) {
      fecha.estado = data.estado

      if ('ocupado_por' in data) {
        fecha.ocupado_por = data.ocupado_por
      }
    }
  }
})

const procesarFecha = async (fechaId: number) => {
  await $fetch('/api/procesar', {
    method: 'POST',
    body: { fechaId, clientId: clientId.value },
  })
}

const confirmarFecha = async (fechaId: number) => {
  await $fetch('api/confirmar', {
    method: 'POST',
    body: { fechaId, clientId: clientId.value },
  })
}
</script>

<template>
  <div>
    <div v-for="fecha in fechas" :key="fecha.id">
      <button
        :disabled="fecha.estado !== 'disponible'"
        @click="procesarFecha(fecha.id)"
      >
        Fecha {{ fecha.id }} - {{ fecha.estado }}
      </button>

      <button
        v-if="fecha.estado === 'en_proceso' && fecha.ocupado_por === clientId"
        @click="confirmarFecha(fecha.id)"
      >
        Confirmar
      </button>
    </div>
  </div>
</template>
