<template>
  <ion-page>
    <header-component page-title="Check scores" />
    <ion-content :fullscreen="true">
      <refresher-component />
      <ion-item color="primary">
        <ion-select v-model="selectedTime" interface="popover" placeholder="Choisir un horaire">
          <ion-select-option v-for="(timeSlot, index) in schedules" :key="index" :value="index">
            {{ timeSlot.start }} - {{ timeSlot.stop }}
          </ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item v-if="isFilled" color="success" class="">
        <ion-icon slot="end" :ios="checkmarkCircle" :md="checkmarkCircleSharp" />
        <ion-label>Tous les scores ont été enregistrés</ion-label>
      </ion-item>
      <div v-if="selectedTime === DEFAULT_TIME_VALUE" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Sélectionne un horaire <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
      </div>
      <div v-else-if="isLoadingMatches" class="ion-text-center">
        <ion-spinner />
      </div>
      <div v-else-if="errorLoadingMatches" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <ion-text color="error">
          Impossible de charger les duels
        </ion-text>
      </div>
      <div v-else-if="matches && matches.length === 0" class="not-found">
        <strong class="capitalize">Il n'y a pas de duels pour cet horaire</strong>
      </div>
      <ion-list v-else>
        <div v-if="matches && matches.length > 0">
          <ion-item
            v-for="match in matches"
            :key="match.id"
            :router-link="`/match/${match.id}`"
            router-direction="forward"
          >
            <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">
              {{ match.gameId }}
            </ion-badge>
            <ion-label>
              {{ match.gameName }}
            </ion-label>
            <ion-icon
              v-if="isScoreRecorded(match)"
              slot="end"
              :color="iconColor(match)"
              :ios="checkmarkCircle"
              :md="checkmarkCircleSharp"
            />
            <ion-icon v-else slot="end" color="danger" :ios="closeCircle" :md="closeCircleSharp" />
          </ion-item>
        </div>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import type { Match } from '@/types'
import {
  IonBadge,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from '@ionic/vue'
import {
  arrowUpOutline,
  arrowUpSharp,
  checkmarkCircle,
  checkmarkCircleSharp,
  closeCircle,
  closeCircleSharp,
} from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { useTimeMatches } from '@/composables/match'
import { DEFAULT_TIME_VALUE } from '@/constants'

// reactive data
const selectedTime = ref(DEFAULT_TIME_VALUE)

// Composables
const appConfig = useAppConfig()
const { data: matches, pending: isLoadingMatches, error: errorLoadingMatches } = useTimeMatches(selectedTime)

watch(errorLoadingMatches, (error) => {
  if (error) {
    console.error('Error loading matches:', error)
  }
})

// Computed
const schedules = computed(() => {
  if (!appConfig.value) return []
  return appConfig.value.playerSchedule
})

const isFilled = computed(() => {
  if (!matches.value || matches.value.length === 0) return false
  for (const match of matches.value) {
    if (match.noScores) continue
    if (match.winnerTeamId) continue
    if (match.draw) continue
    return false
  }
  return true
})

// Methods

function iconColor(match: Match) {
  if (match.noScores) return 'medium'
  return 'success'
}
function isScoreRecorded(match: Match) {
  return match.winnerTeamId || match.draw || match.noScores
}
</script>

<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
ion-select {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  --placeholder-opacity: 1;
}
</style>
