<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Fecha } from '../../types/fecha'

const reservas = ref<Fecha[]>([])

const fetchReservas = async () => {
  reservas.value = await $fetch<Fecha[]>('/api/reservas')
}

const cancelar = async (id: number) => {
  await $fetch('/api/cancelar', {
    method: 'POST',
    body: { fechaId: id }
  })
}

onMounted(() => {
  fetchReservas()

  const ws = new WebSocket('ws://localhost:3001')

  ws.onmessage = async (event: MessageEvent<string>) => {
    const data = JSON.parse(event.data)

    if (data.type !== 'fecha_update') return

    // Actualizar lista si se reserva o cancela una fecha
    if (data.estado === 'reservada' || data.estado === 'disponible') {
      await fetchReservas()
    }
  }
})
</script>

<template>
  <div class="container">
    <div class="card">
      <h1>Reservas activas</h1>

      <div class="list">
        <div
          v-for="f in reservas"
          :key="f.id"
          class="item"
        >
          <div class="content">
            <span class="date">
              {{ new Date(f.fecha).toISOString().split('T')[0] }}
            </span>
          </div>

          <button class="cancel" @click="cancelar(f.id)">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
