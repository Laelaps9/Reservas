<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Fecha, FechaEstado } from '../../types/fecha'

const fechas = ref<Fecha[]>([])
const fechaSeleccionadaId = ref<number | null>(null)

// UUID para identificar al usuario
const clientId = useState<string>('clientId', () => crypto.randomUUID())

const fetchFechas = async () => {
  fechas.value = await $fetch<Fecha[]>('/api/fechas')
}

const seleccionarFecha = async (fechaId: number) => {
  try {
    await $fetch('/api/seleccionar', {
      method: 'POST',
      body: {
        fechaId,
        clientId: clientId.value
      }
    })

    fechaSeleccionadaId.value = fechaId
  } catch (err) {
    console.error(err)
  }
}

const confirmarFecha = async () => {
  if (!fechaSeleccionadaId.value) return

  await $fetch('/api/confirmar', {
    method: 'POST',
    body: {
      fechaId: fechaSeleccionadaId.value,
      clientId: clientId.value
    }
  })
}

const isDisabled = (d: Fecha) => {
  return d.estado === 'reservada' ||
      (d.estado === 'en_proceso' && d.ocupado_por !== clientId.value)
}

const isMine = (d: Fecha) => {
  return d.estado === 'en_proceso' && d.ocupado_por === clientId.value
}


onMounted(() => {
  fetchFechas()

  const ws = new WebSocket('ws://localhost:3001')

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'init',
      clientId: clientId.value
    }))
  }

  ws.onmessage = (event: MessageEvent<string>) => {
    const data = JSON.parse(event.data)

    if (data.type !== 'fecha_update') return

    const fecha = fechas.value.find(f => f.id === data.fechaId)
    if (!fecha) return

    fecha.estado = data.estado
    fecha.ocupado_por = data.ocupado_por

    if (data.ocupado_por !== clientId.value && fechaSeleccionadaId.value === fecha.id) {
      fechaSeleccionadaId.value = null
    }

    if (data.estado === 'reservada' && fechaSeleccionadaId.value === fecha.id) {
      fechaSeleccionadaId.value = null
    }
  }
})

const procesarFecha = async (fechaId: number) => {
  await $fetch('/api/procesar', {
    method: 'POST',
    body: { fechaId, clientId: clientId.value },
  })
}

</script>

<template>
  <div class="container">
    <div class="card">
      <h1>Selecciona una fecha</h1>

      <div class="list">
        <label
          v-for="f in fechas"
          :key="f.id"
          class="item"
          :class="{
            disabled: isDisabled(f) || f.estado === 'reservada',
            seleccionado: isMine(f)
          }"
        >
          <input
            type="radio"
            :value="f.id"
            v-model="fechaSeleccionadaId"
            :disabled="isDisabled(f)"
            @change="() => seleccionarFecha(f.id)"
          />

          <div class="content">
            <span class="date">
              {{ new Date(f.fecha).toISOString().split('T')[0] }}
            </span>

            <span class="status">
              <template v-if="f.estado === 'reservada'"></template>
              <template v-else-if="isMine(f)"></template>
              <template v-else-if="f.estado === 'en_proceso'"></template>
              <template v-else>Disponible</template>
            </span>
          </div>
        </label>
      </div>

      <button
        class="confirm"
        :disabled="!fechaSeleccionadaId"
        @click="confirmarFecha"
      >
        Confirmar
      </button>
    </div>
  </div>
</template>
