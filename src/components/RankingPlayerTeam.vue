<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Team</ion-card-title>
    </ion-card-header>
    <ion-card-content v-if="!printableScores" class="ion-no-padding ion-padding-vertical">
      <div v-if="isLoading" class="ion-text-center ion-align-items-center">
        <ion-spinner />
      </div>
      <div v-else-if="errorLoading" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Erreur lors du chargement
        </h2>
      </div>
      <transition-group v-else-if="teams.length > 0" name="fade-slide" tag="ion-list">
        <ion-item
          v-for="(team, index) in teams"
          :key="team.id"
          :router-link="`/team/${team.id}`"
          router-direction="forward"
        >
          <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">
            {{ index + 1 }}
          </ion-badge>
          <ion-label class="ion-text-wrap">
            <b>{{ team.id }}</b> {{ team.groupName }} <ion-text color="medium"> ({{ team.groupCity }}) </ion-text>
          </ion-label>
          <ion-badge slot="end" class="ion-no-margin" color="primary">
            {{ team.score }}
          </ion-badge>
        </ion-item>
      </transition-group>
      <div v-else>
        <h2 class="ion-text-center ion-align-items-center">
          Pas de classement
        </h2>
      </div>
    </ion-card-content>
    <ion-card-content v-else>
      <div>
        <br><br>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Équipe</th>
              <th>Section</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(team, index) in teams" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ team.id }}</td>
              <td>{{ team.groupName }} ({{ team.groupCity }})</td>
              <td>{{ team.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
} from '@ionic/vue'
import { defineProps, watch } from 'vue'
import { useTopTeams } from '@/composables/team'
import { errorPopup } from '@/utils/popup'

const props = defineProps<{
  groupCategoryId: string
  limit: number
  printableScores: boolean
}>()

// composable
const { data: teams, pending: isLoading, error: errorLoading } = useTopTeams(props.groupCategoryId, props.limit)
watch(errorLoading, (error) => {
  if (error) {
    errorPopup('Erreur lors du chargement des équipes')
    console.error('Error loading teams:', error)
  }
})
</script>

<style scoped>
.fade-slide-move,
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 1s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}
.fade-slide-leave-active {
  position: absolute;
}
</style>
