<template>
  <ion-page>
    <header-component page-title="Animateurs" />
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component />
      <ion-card>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ion-select v-if="groups" v-model="selectedGroupId" placeholder="Section" interface="popover">
                  <ion-select-option v-for="group in groups" :key="group.id" color="dark" :value="group.id">
                    {{ group.name }} ({{ group.city }})
                  </ion-select-option>
                </ion-select>
                <ion-spinner v-else-if="isLoadingGroups" />
                <div v-else-if="errorLoadingGroups">
                  Erreur au chargement des sections
                </div>
                <div v-else>
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
                <ion-card-title>
                  <span>Détails </span>
                  <ion-badge v-if="selectedGroup && selectedGroup.role >= GROUP_ROLES.Staff" color="danger">
                    Staff
                  </ion-badge>
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="selectedGroup">
                  <ion-item> <ion-label>Nom</ion-label>{{ selectedGroup.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ selectedGroup.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ selectedGroup.unit }} </ion-item>
                </ion-list>
                <div v-else-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <ion-spinner />
                </div>
                <div v-else-if="errorLoadingGroup" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <ion-text color="error">
                    Impossible de charger les sections
                  </ion-text>
                </div>
                <ion-list-header v-else>
                  <h2>Aucune section trouvée</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Membres</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-item v-if="nbApplicants !== '0'" router-link="/applicants" router-direction="forward">
                  <ion-label>Membres en attente de validation</ion-label>
                  <ion-badge slot="end" color="warning">
                    {{ nbApplicants }}
                  </ion-badge>
                </ion-item>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <ion-spinner />
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <ion-text color="error">
                    Impossible de charger les animateurs
                  </ion-text>
                </div>
                <ion-list v-else-if="groupMembers && groupMembers.length > 0">
                  <ion-item
                    v-for="user in groupMembers"
                    :key="user.id"
                    :router-link="`/profile/${user.id}`"
                    router-direction="forward"
                    button
                  >
                    <ion-label>{{ getUserName(user) }}</ion-label>
                    <div v-if="user.role <= USER_ROLES.Chef">
                      <ion-badge v-if="countGames(user) === 0" slot="end" color="danger">
                        Pas inscrit
                      </ion-badge>
                      <ion-badge v-else slot="end" :color="countGames(user) < maxGames ? 'warning' : 'success'">
                        {{ countGames(user) }}
                      </ion-badge>
                    </div>
                  </ion-item>
                </ion-list>
                <ion-list-header v-else>
                  <h2>Aucun membre trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title v-if="selectedGroup && selectedGroup.role >= GROUP_ROLES.Staff">
                  Administrateur
                </ion-card-title>
                <ion-card-title v-else>
                  Chefs
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <ion-spinner />
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <ion-text color="error">
                    Impossible de charger les animateurs
                  </ion-text>
                </div>
                <ion-list v-else-if="groupLeaders && groupLeaders.length > 0">
                  <ion-item
                    v-for="user in groupLeaders"
                    :key="user.id"
                    :router-link="`/profile/${user.id}`"
                    router-direction="forward"
                    button
                  >
                    <ion-label>{{ getUserName(user) }}</ion-label>
                    <div v-if="user.role <= USER_ROLES.Chef">
                      <ion-badge v-if="countGames(user) === 0" slot="end" color="danger">
                        Pas inscrit
                      </ion-badge>
                      <ion-badge v-else slot="end" :color="countGames(user) < maxGames ? 'warning' : 'success'">
                        {{ countGames(user) }}
                      </ion-badge>
                    </div>
                  </ion-item>
                </ion-list>
                <ion-list-header v-else>
                  <h2>Aucun chef trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Sélectionne une catégorie et une section <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import type { UserProfile } from '@/types'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { useAttendantGroup, useAttendantGroups } from '@/composables/attendantGroup'
import { useCurrentUserProfile, useGroupApplicants, useMembersOfGroup } from '@/composables/userProfile'
import { DEFAULT_GROUP_ID, GROUP_ROLES, USER_ROLES } from '@/constants'
import { getUserName } from '@/utils/userProfile'
import {
  IonBadge,
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
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import { arrowUpOutline, arrowUpSharp } from 'ionicons/icons'
import { computed, watch } from 'vue'

// composables

const appConfig = useAppConfig()
const selectedGroupId = useRouteParams<string>('groupId', DEFAULT_GROUP_ID)
const { data: selectedGroup, pending: isLoadingGroup, error: errorLoadingGroup } = useAttendantGroup(selectedGroupId)
const {
  data: attendants,
  pending: isLoadingAttendants,
  error: errorLoadingAttendants,
} = useMembersOfGroup(selectedGroupId)
const currentUser = useCurrentUserProfile()
const {
  data: groups,
  pending: isLoadingGroups,
  error: errorLoadingGroups,
} = useAttendantGroups(true, 'include', true, currentUser)
const applicants = useGroupApplicants(50, selectedGroupId.value)

watch([errorLoadingAttendants, errorLoadingGroups, errorLoadingGroup], (errors) => {
  if (errors[0]) {
    console.error('Error loading attendants:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading groups:', errors[1])
  }
  if (errors[2]) {
    console.error('Error loading group data:', errors[2])
  }
})

// Computed data

const groupMembers = computed(() => {
  if (!attendants.value) return []
  return attendants.value.filter(user => user.role <= USER_ROLES.Animateur || user.role === USER_ROLES.Organisateur)
})
const groupLeaders = computed(() => {
  if (!attendants.value) return []
  return attendants.value.filter(user => user.role === USER_ROLES.Chef || user.role === USER_ROLES.Administrateur)
})

const nbApplicants = computed((): string => {
  if (!applicants.value) return '0'
  if (applicants.value.length <= 9) return applicants.value.length.toString()
  return '9+'
})
const maxGames = computed(() => appConfig.value?.attendantSchedule?.length ?? 0)

// Methods

function countGames(user: UserProfile) {
  if (!user.games) return 0
  return Object.keys(user.games).length
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
