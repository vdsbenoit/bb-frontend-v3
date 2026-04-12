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

<template>
  <IonPage>
    <HeaderComponent page-title="Check scores" />
    <IonContent :fullscreen="true">
      <RefresherComponent />
      <IonItem color="primary">
        <IonSelect v-model="selectedTime" interface="popover" placeholder="Choisir un horaire">
          <IonSelectOption v-for="(timeSlot, index) in schedules" :key="index" :value="index">
            {{ timeSlot.start }} - {{ timeSlot.stop }}
          </IonSelectOption>
        </IonSelect>
      </IonItem>
      <IonItem v-if="isFilled" color="success" class="">
        <IonIcon slot="end" :ios="checkmarkCircle" :md="checkmarkCircleSharp" />
        <IonLabel>Tous les scores ont été enregistrés</IonLabel>
      </IonItem>
      <div v-if="selectedTime === DEFAULT_TIME_VALUE" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Sélectionne un horaire <IonIcon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
      </div>
      <div v-else-if="isLoadingMatches" class="ion-text-center">
        <IonSpinner />
      </div>
      <div v-else-if="errorLoadingMatches" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <IonText color="error">
          Impossible de charger les duels
        </IonText>
      </div>
      <div v-else-if="matches && matches.length === 0" class="not-found">
        <strong class="capitalize">Il n'y a pas de duels pour cet horaire</strong>
      </div>
      <IonList v-else>
        <div v-if="matches && matches.length > 0">
          <IonItem
            v-for="match in matches"
            :key="match.id"
            :router-link="`/match/${match.id}`"
            router-direction="forward"
          >
            <IonBadge slot="start" class="ion-no-margin ion-margin-end" color="medium">
              {{ match.gameId }}
            </IonBadge>
            <IonLabel>
              {{ match.gameName }}
            </IonLabel>
            <IonIcon
              v-if="isScoreRecorded(match)"
              slot="end"
              :color="iconColor(match)"
              :ios="checkmarkCircle"
              :md="checkmarkCircleSharp"
            />
            <IonIcon v-else slot="end" color="danger" :ios="closeCircle" :md="closeCircleSharp" />
          </IonItem>
        </div>
      </IonList>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
ion-select {
  display: block;
  width: min(100%, 320px);
  margin-inline: auto;
  text-align: center;
  --placeholder-opacity: 1;
}

ion-select::part(wrapper),
ion-select::part(inner),
ion-select::part(container) {
  justify-content: center;
}

ion-select::part(placeholder) {
  text-align: center;
  width: 100%;
}

ion-select::part(icon) {
  position: absolute;
  right: 0;
}
</style>
