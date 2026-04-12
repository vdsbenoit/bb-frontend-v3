<script setup lang="ts">
import type { UserProfile } from '@/types'
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
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { useAttendantGroup, useAttendantGroups } from '@/composables/attendantGroup'
import { useCurrentUserProfile, useGroupApplicants, useMembersOfGroup } from '@/composables/userProfile'
import { DEFAULT_GROUP_ID, GROUP_ROLES, USER_ROLES } from '@/constants'
import { getUserName } from '@/utils/userProfile'

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

<template>
  <IonPage>
    <HeaderComponent page-title="Animateurs" />
    <IonContent :fullscreen="true" class="ion-padding">
      <RefresherComponent />
      <IonCard>
        <IonCardContent class="ion-no-padding">
          <IonGrid class="">
            <IonRow>
              <IonCol size="12" size-sm="6">
                <IonSelect v-if="groups" v-model="selectedGroupId" placeholder="Section" interface="popover">
                  <IonSelectOption v-for="group in groups" :key="group.id" color="dark" :value="group.id">
                    {{ group.name }} ({{ group.city }})
                  </IonSelectOption>
                </IonSelect>
                <IonSpinner v-else-if="isLoadingGroups" />
                <div v-else-if="errorLoadingGroups">
                  Erreur au chargement des sections
                </div>
                <div v-else>
                  Pas de section configurée
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
      <IonGrid v-if="selectedGroupId" class="ion-no-padding">
        <IonRow>
          <IonCol size="12" size-sm="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <span>Détails </span>
                  <IonBadge v-if="selectedGroup && selectedGroup.role >= GROUP_ROLES.Staff" color="danger">
                    Staff
                  </IonBadge>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList v-if="selectedGroup">
                  <IonItem> <IonLabel>Nom</IonLabel>{{ selectedGroup.name }} </IonItem>
                  <IonItem> <IonLabel>Ville</IonLabel>{{ selectedGroup.city }} </IonItem>
                  <IonItem> <IonLabel>Unité</IonLabel>{{ selectedGroup.unit }} </IonItem>
                </IonList>
                <div v-else-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <IonSpinner />
                </div>
                <div v-else-if="errorLoadingGroup" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <IonText color="error">
                    Impossible de charger les sections
                  </IonText>
                </div>
                <IonListHeader v-else>
                  <h2>Aucune section trouvée</h2>
                </IonListHeader>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="12" size-sm="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Membres</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem v-if="nbApplicants !== '0'" router-link="/applicants" router-direction="forward">
                  <IonLabel>Membres en attente de validation</IonLabel>
                  <IonBadge slot="end" color="warning">
                    {{ nbApplicants }}
                  </IonBadge>
                </IonItem>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <IonSpinner />
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <IonText color="error">
                    Impossible de charger les animateurs
                  </IonText>
                </div>
                <IonList v-else-if="groupMembers && groupMembers.length > 0">
                  <IonItem
                    v-for="user in groupMembers"
                    :key="user.id"
                    :router-link="`/profile/${user.id}`"
                    router-direction="forward"
                    button
                  >
                    <IonLabel>{{ getUserName(user) }}</IonLabel>
                    <div v-if="user.role <= USER_ROLES.Chef">
                      <IonBadge v-if="countGames(user) === 0" slot="end" color="danger">
                        Pas inscrit
                      </IonBadge>
                      <IonBadge v-else slot="end" :color="countGames(user) < maxGames ? 'warning' : 'success'">
                        {{ countGames(user) }}
                      </IonBadge>
                    </div>
                  </IonItem>
                </IonList>
                <IonListHeader v-else>
                  <h2>Aucun membre trouvé</h2>
                </IonListHeader>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="12" size-sm="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle v-if="selectedGroup && selectedGroup.role >= GROUP_ROLES.Staff">
                  Administrateur
                </IonCardTitle>
                <IonCardTitle v-else>
                  Chefs
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <IonSpinner />
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <IonText color="error">
                    Impossible de charger les animateurs
                  </IonText>
                </div>
                <IonList v-else-if="groupLeaders && groupLeaders.length > 0">
                  <IonItem
                    v-for="user in groupLeaders"
                    :key="user.id"
                    :router-link="`/profile/${user.id}`"
                    router-direction="forward"
                    button
                  >
                    <IonLabel>{{ getUserName(user) }}</IonLabel>
                    <div v-if="user.role <= USER_ROLES.Chef">
                      <IonBadge v-if="countGames(user) === 0" slot="end" color="danger">
                        Pas inscrit
                      </IonBadge>
                      <IonBadge v-else slot="end" :color="countGames(user) < maxGames ? 'warning' : 'success'">
                        {{ countGames(user) }}
                      </IonBadge>
                    </div>
                  </IonItem>
                </IonList>
                <IonListHeader v-else>
                  <h2>Aucun chef trouvé</h2>
                </IonListHeader>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Sélectionne une catégorie et une section <IonIcon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
      </div>
    </IonContent>
  </IonPage>
</template>

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
