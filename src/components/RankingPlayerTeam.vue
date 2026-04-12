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
import { watch } from 'vue'
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
    void errorPopup('Erreur lors du chargement des équipes')
    console.error('Error loading teams:', error)
  }
})
</script>

<template>
  <IonCard>
    <IonCardHeader>
      <IonCardTitle>Team</IonCardTitle>
    </IonCardHeader>
    <IonCardContent v-if="!printableScores" class="ion-no-padding ion-padding-vertical">
      <div v-if="isLoading" class="ion-text-center ion-align-items-center">
        <IonSpinner />
      </div>
      <div v-else-if="errorLoading" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Erreur lors du chargement
        </h2>
      </div>
      <transition-group v-else-if="teams.length > 0" name="fade-slide" tag="ion-list">
        <IonItem
          v-for="(team, index) in teams"
          :key="team.id"
          :router-link="`/team/${team.id}`"
          router-direction="forward"
        >
          <IonBadge slot="start" class="ion-no-margin ion-margin-end" color="medium">
            {{ index + 1 }}
          </IonBadge>
          <IonLabel class="ion-text-wrap">
            <b>{{ team.id }}</b> {{ team.groupName }} <IonText color="medium"> ({{ team.groupCity }}) </IonText>
          </IonLabel>
          <IonBadge slot="end" class="ion-no-margin" color="primary">
            {{ team.score }}
          </IonBadge>
        </IonItem>
      </transition-group>
      <div v-else>
        <h2 class="ion-text-center ion-align-items-center">
          Pas de classement
        </h2>
      </div>
    </IonCardContent>
    <IonCardContent v-else>
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
    </IonCardContent>
  </IonCard>
</template>

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
