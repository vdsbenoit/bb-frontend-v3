<template>
  <ion-page>
    <header-component page-title="Sections" />
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component />
      <ion-card>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ion-spinner v-if="isLoadingAppConfig" />
                <div v-else-if="errorLoadingAppConfig">
                  Erreur au chargement des catégories de sections
                </div>
                <ion-select
                  v-else-if="appConfig && appConfig.groupCategories"
                  v-model="selectedGroupCategoryId"
                  interface="popover"
                  placeholder="Catégorie de section"
                >
                  <ion-select-option
                    v-for="(groupCategory, groupCategoryId) in appConfig.groupCategories"
                    :key="groupCategoryId"
                    :value="groupCategoryId"
                  >
                    {{ groupCategory.name }}
                  </ion-select-option>
                </ion-select>
                <div v-else class="ion-text-center">
                  Pas de catégorie de section configurée
                </div>
              </ion-col>
              <ion-col v-if="selectedGroupCategoryId" size="12" size-sm="6">
                <ion-spinner v-if="isLoadingGroups" />
                <div v-else-if="errorLoadingGroups">
                  Erreur au chargement des sections
                </div>
                <ion-select
                  v-else-if="groups && groups.length > 0"
                  v-model="selectedGroupId"
                  placeholder="Section"
                  interface="popover"
                >
                  <ion-select-option v-for="group in groups" :key="group.id" color="dark" :value="group.id">
                    {{ group.id }} - {{ group.name }} ({{ group.city }})
                  </ion-select-option>
                </ion-select>
                <div v-else class="ion-text-center">
                  Pas de section configurée
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-grid v-if="selectedGroupId" class="ion-no-padding">
        <ion-row>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Détails</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <ion-spinner />
                </div>
                <ion-list-header v-else-if="errorLoadingGroup" class="ion-text-center ion-align-items-center">
                  <p>Erreur lors du chargement de la section</p>
                </ion-list-header>
                <ion-list v-else-if="selectedGroup">
                  <ion-item> <ion-label>Numéro</ion-label>{{ selectedGroup.id }} </ion-item>
                  <ion-item> <ion-label>Nom</ion-label>{{ selectedGroup.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ selectedGroup.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ selectedGroup.unit }} </ion-item>
                  <ion-item> <ion-label>Nombre d'animés inscrits</ion-label>{{ selectedGroup.nbPlayers }} </ion-item>
                  <ion-item>
                    <ion-label>Nombre d'animateurs inscrits</ion-label>{{ selectedGroup.nbLeaders }}
                  </ion-item>
                  <ion-item> <ion-label>Nombre d'équipes</ion-label>{{ selectedGroup.nbTeams }} </ion-item>
                </ion-list>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
            <ion-card v-if="canSeeRanking">
              <ion-card-header>
                <ion-card-title> Classement </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <ion-spinner />
                </div>
                <div v-else-if="selectedGroup">
                  <ion-list class="no-pointer">
                    <ion-item>
                      <ion-label>Score accumulé</ion-label><ion-note slot="end">
                        {{ selectedGroup.score }}
                      </ion-note>
                    </ion-item>
                    <ion-item>
                      <ion-label>Score moyen</ion-label><ion-note slot="end">
                        {{ selectedGroup.meanScore }}
                      </ion-note>
                    </ion-item>
                  </ion-list>
                </div>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
                <ion-button
                  v-if="canSeeModerationStuff"
                  expand="block"
                  color="primary"
                  class="ion-margin-horizontal ion-margin-top"
                  @click="computeMeanScore"
                >
                  Recalculer le score moyen
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Équipes</ion-card-title>
              </ion-card-header>
              <info-card-component v-if="canSelectTeam">
                Tu peux sélectionner une équipe ci-dessous et la marquer comme ton équipe
              </info-card-component>
              <ion-card-content>
                <div v-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <ion-spinner />
                </div>
                <div v-else-if="selectedGroup">
                  <ion-list v-if="selectedGroup.teams && selectedGroup.teams.length > 0">
                    <ion-item
                      v-for="teamId in selectedGroup.teams"
                      :key="teamId"
                      :router-link="`/team/${teamId}`"
                      router-direction="forward"
                      button
                    >
                      <ion-label>{{ teamId }}</ion-label>
                      <ion-badge
                        v-if="currentUserProfile && teamId === currentUserProfile.teamId"
                        slot="end"
                        color="primary"
                        class="ion-padding-horizontal"
                      >
                        Ton équipe
                      </ion-badge>
                    </ion-item>
                  </ion-list>
                  <ion-list-header v-else>
                    <h2>Aucune équipe trouvée</h2>
                  </ion-list-header>
                </div>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col v-if="canSeeModerationStuff" size="12" size-sm="6">
            <ion-button
              v-if="!shouldLoadMembers && selectedGroupId"
              expand="block"
              color="primary"
              class="ion-margin-horizontal"
              @click="shouldLoadMembers = true"
            >
              Charger les membres
            </ion-button>
            <ion-card v-if="shouldLoadMembers">
              <ion-card-header>
                <ion-card-title>Membres</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingMembers" class="ion-text-center ion-align-items-center">
                  <ion-spinner />
                </div>
                <div v-else-if="errorLoadingMembers" class="ion-text-center ion-align-items-center">
                  <p>Erreur lors du chargement des membres</p>
                </div>
                <ion-list v-else-if="groupMembers && groupMembers.length > 0">
                  <ion-item
                    v-for="member in groupMembers"
                    :key="member.id"
                    :router-link="`/profile/${member.id}`"
                    router-direction="forward"
                  >
                    <ion-label>{{ member.name }}</ion-label>
                    <ion-badge
                      v-if="member.role === USER_ROLES.Chef"
                      slot="end"
                      color="warning"
                      class="ion-padding-horizontal"
                    >
                      Chef
                    </ion-badge>
                  </ion-item>
                </ion-list>
                <ion-list-header v-else>
                  <h2>Aucun membre trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <div v-else class="not-found">
        <h2 v-if="!selectedGroupCategoryId" class="ion-text-center ion-align-items-center">
          Sélectionne une catégorie de section<ion-icon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
        <h2 v-else class="ion-text-center ion-align-items-center">
          Sélectionne une section <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderComponent from '@/components/HeaderComponent.vue'
import InfoCardComponent from '@/components/InfoCardComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { usePlayerGroup, usePlayerGroups } from '@/composables/playerGroup'
import { useCanSeeModerationStuff, useCanSeeRanking } from '@/composables/rights'
import { useCurrentUserProfile, useMembersOfGroup } from '@/composables/userProfile'
import { DEFAULT_GROUP_CATEGORY_ID, DEFAULT_GROUP_ID, USER_ROLES } from '@/constants'
import { updateGroupMeanScore } from '@/utils/playerGroup'
import { errorPopup, loadingPopup } from '@/utils/popup'
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import { arrowUpOutline, arrowUpSharp } from 'ionicons/icons'
import { computed, ref, watch, watchEffect } from 'vue'

// reactive data

const selectedGroupCategoryId = ref(DEFAULT_GROUP_CATEGORY_ID)
const shouldLoadMembers = ref(false) // true after clicking on the show button

// Composables

const currentUserProfile = useCurrentUserProfile()
const selectedGroupId = useRouteParams<string>('groupId', DEFAULT_GROUP_ID)
const { data: selectedGroup, pending: isLoadingGroup, error: errorLoadingGroup } = usePlayerGroup(selectedGroupId)
const { data: appConfig, pending: isLoadingAppConfig, error: errorLoadingAppConfig } = useAppConfig()
const { data: groups, pending: isLoadingGroups, error: errorLoadingGroups } = usePlayerGroups(selectedGroupCategoryId)
const {
  data: groupMembers,
  pending: isLoadingMembers,
  error: errorLoadingMembers,
} = useMembersOfGroup(selectedGroupId, shouldLoadMembers)
const canSeeRanking = useCanSeeRanking()
const canSeeModerationStuff = useCanSeeModerationStuff()

// Watchers

// If the groupId is provided in the URL, this watcher sets the selectedgroupCategoryId
watchEffect(() => {
  if (
    selectedGroupId.value
    && selectedGroup.value
    && selectedGroup.value.groupCategoryId
    && selectedGroupCategoryId.value === DEFAULT_GROUP_CATEGORY_ID
  ) {
    selectedGroupCategoryId.value = selectedGroup.value.groupCategoryId
  }
})
// If selectedGroupId changes, reset the shouldLoadMembers switch
watch(selectedGroupId, () => {
  shouldLoadMembers.value = false
})

watch([errorLoadingGroup, errorLoadingGroups, errorLoadingMembers, errorLoadingAppConfig], (errors) => {
  if (errors[0]) {
    console.error('Error loading group data:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading groups:', errors[1])
  }
  if (errors[2]) {
    console.error('Error loading members:', errors[2])
  }
  if (errors[3]) {
    console.error('Error loading app config:', errors[3])
  }
})

// Computed

const canSelectTeam = computed(() => {
  if (!selectedGroupId.value) return false
  if (!currentUserProfile.value) return false
  return currentUserProfile.value.role === USER_ROLES.Participant && !currentUserProfile.value.teamId
})

// Methods

async function computeMeanScore() {
  if (!selectedGroupId.value || selectedGroupId.value === DEFAULT_GROUP_ID) {
    errorPopup('Aucune section sélectionnée', 'Erreur lors du calcul du score moyen')
    return
  }
  const loading = await loadingPopup('Calcul du score moyen en cours...')
  try {
    await updateGroupMeanScore(selectedGroupId.value)
  } catch (error: any) {
    console.error(error)
    errorPopup(error.message, 'Erreur lors du calcul du score moyen')
  }
  loading.dismiss()
}
</script>

<style scoped>
ion-select {
  width: 100%;
  text-align: center;
  justify-content: center;
  color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-dark);
  /* Set full opacity on the placeholder */
  --placeholder-opacity: 1;
}
</style>
