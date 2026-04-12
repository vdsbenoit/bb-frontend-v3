<template>
  <div>
    <ion-badge
      v-for="(availability, i) in availabilities"
      :key="i"
      slot="end"
      class="ion-no-margin ion-margin-start"
      :color="availability.color"
    >
      {{ availability.nbAttendants }}
    </ion-badge>
  </div>
</template>

<script lang="ts" setup>
import type { Game } from '@/types'
import { IonBadge } from '@ionic/vue'
import { computed, defineProps } from 'vue'
import { useAppConfig, useAppSettings } from '@/composables/app'

// Props

const props = defineProps<{
  game: Game
}>()

// Composables

const appSettings = useAppSettings()
const appConfig = useAppConfig()

// Computed data

const maxGameAttendants = computed(() => {
  if (!appSettings.value) return 2
  return appSettings.value?.maxGameAttendants
})
const attendantSchedule = computed(() => appConfig.value?.attendantSchedule ?? [])

const availabilities = computed(() => {
  const data = []
  for (const timeSlot of attendantSchedule.value) {
    const nbAttendants = props.game.attendants[timeSlot.id] ? props.game.attendants[timeSlot.id].length : 0
    let color = 'success'
    if (nbAttendants < maxGameAttendants.value) color = 'warning'
    if (nbAttendants === 0) color = 'danger'
    data.push({ nbAttendants, color })
  }
  return data
})
</script>

<style scoped></style>
