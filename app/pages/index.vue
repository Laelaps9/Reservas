<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Asiento, AsientoEstado } from '../../types/asiento'

const asientos = ref<Asiento[]>([])

const fetchAsientos = async () => {
  asientos.value = await $fetch<Asiento[]>('/api/asientos')
}

onMounted(() => {
  fetchAsientos()

  const ws = new WebSocket('ws://localhost:3001')

  ws.onmessage = (event: MessageEvent<string>) => {
    const data: {
      type: 'asiento_update',
      asientoId: number,
      estado: AsientoEstado,
    } = JSON.parse(event.data)

    const asiento = asientos.value.find((s) => s.id === data.asientoId)
    if (asiento) {
      asiento.estado = data.estado
    }
  }
})

const procesarAsiento = async (asientoId: number) => {
  await $fetch('/api/procesar', {
    method: 'POST',
    body: { asientoId },
  })
}

const confirmarAsiento = async (asientoId: number) => {
  await $fetch('api/confirmar', {
    method: 'POST',
    body: { asientoId },
  })
}
</script>

<template>
  <div>
    <div v-for="asiento in asientos" :key="asiento.id">
      <button
        :disabled="asiento.estado !== 'disponible'"
        @click="procesarAsiento(asiento.id)"
      >
        Asiento {{ asiento.id }} - {{ asiento.estado }}
      </button>

      <button
        v-if="asiento.estado === 'en_proceso'"
        @click="confirmarAsiento(asiento.id)"
      >
        Confirmar
      </button>
    </div>
  </div>
</template>
