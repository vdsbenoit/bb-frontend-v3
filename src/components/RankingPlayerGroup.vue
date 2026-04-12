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
import { useTopPlayerGroups } from '@/composables/playerGroup'
import { errorPopup } from '@/utils/popup'

const props = defineProps<{
  groupCategoryId: string
  limit: number
  printableScores: boolean
}>()

// composable
const { data: groups, pending: isLoading, error: errorLoading } = useTopPlayerGroups(props.groupCategoryId, props.limit)
watch(errorLoading, (error) => {
  if (error) {
    void errorPopup('Erreur lors du chargement des sections')
    console.error('Error loading player groups:', error)
  }
})
</script>

<template>
  <IonCard>
    <IonCardHeader>
      <IonCardTitle>Section</IonCardTitle>
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
      <transition-group v-else-if="groups.length > 0" name="fade-slide" tag="ion-list">
        <IonItem
          v-for="(group, index) in groups"
          :key="group.id"
          :router-link="`/player-group/${group.id}`"
          router-direction="forward"
        >
          <IonBadge slot="start" class="ion-no-margin ion-margin-end" color="medium">
            {{ index + 1 }}
          </IonBadge>
          <IonLabel class="ion-text-wrap">
            <b>{{ group.id }}</b> {{ group.name }} <IonText color="medium"> ({{ group.city }}) </IonText>
          </IonLabel>
          <IonBadge slot="end" class="ion-no-margin" color="primary">
            {{ group.meanScore }}
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
              <th>Section</th>
              <th>Ville</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(group, index) in groups" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ group.name }}</td>
              <td>{{ group.city }}</td>
              <td>{{ group.meanScore }}</td>
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
.fade-slide-leave-from,
.fade-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.fade-slide-leave-active {
  position: absolute;
}
</style>
