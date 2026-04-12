<template>
  <ion-page>
    <header-component :page-title="pageTitle">
      <ion-button v-if="isCurrentUserTeam" @click="unRegisterPlayer">
        <ion-icon slot="icon-only" :icon="star" />
      </ion-button>
      <ion-button v-if="showRegisterButton" @click="registerPlayer">
        <ion-icon slot="icon-only" :icon="starOutline" />
      </ion-button>
    </header-component>
    <ion-content :fullscreen="true">
      <refresher-component />
      <div v-if="isLoadingTeam" class="ion-text-center">
        <ion-spinner />
      </div>
      <div v-else-if="errorLoadingTeam" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <ion-text color="error">
          Impossible de charger l'équipe
        </ion-text>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else-if="!team" class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette équipe...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else>
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <div class="ion-align-items-center ion-justify-content-start" style="display: flex">
                <ion-card-subtitle v-if="team.groupCity" class="ion-no-margin">
                  {{ team.groupCity }}
                </ion-card-subtitle>
                <ion-button
                  fill="clear"
                  class="ion-no-padding ion-no-margin ion-margin-start"
                  size="small"
                  :router-link="`/player-group/${team.groupId}`"
                  router-direction="root"
                >
                  Voir la section
                </ion-button>
              </div>
              <h1 v-if="team.groupName" class="ion-no-margin" style="font-weight: bold">
                {{ team.groupName }}
              </h1>
              <ion-spinner v-else />
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                {{ teamId }}
              </span>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card v-if="showRanking">
          <ion-card-header>
            <ion-card-title>Score</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list class="no-pointer">
              <ion-item class="ion-no-padding">
                <ion-label>Score de l'équipe</ion-label><ion-note slot="end">
                  {{ team.score }}
                </ion-note>
              </ion-item>
              <ion-item class="ion-no-padding">
                <ion-label>Score de la section</ion-label>
                <ion-badge v-if="errorLoadingPlayerGroup" slot="end" class="ion-no-margin" color="danger">
                  error
                </ion-badge>
                <ion-note v-else slot="end">
                  <ion-spinner v-if="isLoadingPlayerGroup" />
                  <span v-else>{{ playerGroup?.score }}</span>
                </ion-note>
              </ion-item>
              <ion-item class="ion-no-padding" lines="none">
                <ion-label>Moyenne de la section</ion-label>
                <ion-badge v-if="errorLoadingPlayerGroup" slot="end" class="ion-no-margin" color="danger">
                  error
                </ion-badge>
                <ion-note v-else slot="end">
                  <ion-spinner v-if="isLoadingPlayerGroup" />
                  <span v-else>{{ playerGroupMeanScore }}</span>
                </ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
        <ion-button
          v-if="showRegisterButton"
          :disabled="isRegistering"
          expand="block"
          color="primary"
          class="ion-margin"
          @click="registerPlayer"
        >
          <ion-spinner v-if="isRegistering" />
          <span v-else>C'est mon équipe </span>
        </ion-button>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="isLoadingMatches" class="ion-text-center">
              <ion-spinner />
            </div>
            <ion-list-header v-else-if="errorLoadingMatches">
              <strong class="capitalize">Erreur</strong>
              <ion-text color="error">
                Impossible de charger les duels
              </ion-text>
            </ion-list-header>
            <ion-list-header v-else-if="matches && matches.length === 0">
              <h2>Aucun duel trouvé</h2>
            </ion-list-header>
            <ion-list v-else>
              <div v-for="[i, timeSlot] in playerSchedule.entries()" :key="i">
                <ion-item v-if="Object.keys(breaks).includes(i.toString())" class="ion-no-padding">
                  <ion-avatar slot="start" class="ion-margin-end">
                    <ion-icon :icon="pauseSharp" />
                  </ion-avatar>
                  <ion-label>
                    <span>{{ breaks[i] }}</span>
                    <p>
                      <span class="time-slot">{{ timeSlot.start }} - {{ timeSlot.stop }}</span>
                    </p>
                  </ion-label>
                </ion-item>
                <ion-item
                  v-else
                  :router-link="`/match/${getMatch(i)?.id}`"
                  router-direction="forward"
                  class="ion-no-padding"
                >
                  <ion-avatar slot="start" class="ion-margin-end">
                    {{ getMatch(i)?.gameId }}
                  </ion-avatar>
                  <ion-label>
                    <span class="ion-text-wrap">{{ getMatch(i)?.gameName }}</span>
                    <p>
                      <span class="time-slot">{{ timeSlot.start }} - {{ timeSlot.stop }}</span>
                    </p>
                  </ion-label>
                  <ion-icon
                    slot="end"
                    :ios="getMatchStatusIcon(i).ios"
                    :md="getMatchStatusIcon(i).md"
                    :color="getMatchStatusIcon(i).color"
                  />
                </ion-item>
              </div>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
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
  IonSpinner,
  IonText,
  useIonRouter,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import {
  closeOutline,
  closeSharp,
  pauseSharp,
  reorderTwoOutline,
  reorderTwoSharp,
  star,
  starOutline,
  trophyOutline,
  trophySharp,
} from 'ionicons/icons'
import { computed, onMounted, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig, useAppSettings } from '@/composables/app'
import { useTeamMatches } from '@/composables/match'
import { usePlayerGroup } from '@/composables/playerGroup'
import { useTeam } from '@/composables/team'
import { useCurrentUserProfile } from '@/composables/userProfile'
import { DEFAULT_GROUP_ID, DEFAULT_TEAM_ID, USER_ROLES } from '@/constants'
import { errorPopup, toastPopup } from '@/utils/popup'
import { updateUserProfile } from '@/utils/userProfile'

// reactive data

const isRegistering = ref(false)

// composables

const router = useIonRouter()
const user = useCurrentUserProfile()
const appConfig = useAppConfig()
const settings = useAppSettings()
const teamId = useRouteParams<string>('teamId', DEFAULT_TEAM_ID)
const { data: team, pending: isLoadingTeam, error: errorLoadingTeam } = useTeam(teamId)
const {
  data: playerGroup,
  pending: isLoadingPlayerGroup,
  error: errorLoadingPlayerGroup,
} = usePlayerGroup(() => team.value?.groupId ?? DEFAULT_GROUP_ID)
const { data: matches, pending: isLoadingMatches, error: errorLoadingMatches } = useTeamMatches(teamId)

watch([errorLoadingTeam, errorLoadingPlayerGroup, errorLoadingMatches], (errors) => {
  if (errors[0]) {
    console.error('Error loading team:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading player group:', errors[1])
  }
  if (errors[2]) {
    console.error('Error loading matches:', errors[2])
  }
})

// lifecycle hooks

onMounted(() => {
  if (teamId.value === DEFAULT_TEAM_ID) {
    const msg = 'Team ID missing from the url'
    void toastPopup(msg)
    console.error(msg)
  }
})

// Computed

const pageTitle = computed(() => {
  if (team.value) return `Equipe ${team.value.id}`
  if (isLoadingTeam.value) return 'Chargement'
  return 'Équipe inconnue'
})
const playerSchedule = computed(() => {
  if (!appConfig.value) return []
  return appConfig.value.playerSchedule
})
const showRanking = computed(() => {
  if (settings.value?.isRankingPublic) return true
  if (!user.value) return false
  return user.value.role >= USER_ROLES.Organisateur
})
const isCurrentUserTeam = computed(() => {
  if (!user.value?.teamId) return false
  return user.value.teamId === teamId.value
})
const showRegisterButton = computed(() => {
  if (!user.value) return false
  if (isCurrentUserTeam.value) return false
  return user.value.role === USER_ROLES.Participant
})
const playerGroupMeanScore = computed(() => {
  if (!playerGroup.value) return 0
  const nbTeams = playerGroup.value.nbTeams
  if (nbTeams === undefined || nbTeams === 0) return 0
  return (playerGroup.value.score / nbTeams).toFixed(2)
})
const breaks = computed(() => {
  if (!appConfig.value || !team.value) return []
  return appConfig.value.groupCategories[team.value.groupCategoryId].breaks
})
function getMatch(time: number) {
  if (!matches.value) return null
  return matches.value.find(match => match.time === time)
}

// Methods

function getMatchStatusIcon(time: number) {
  const match = getMatch(time)
  if (!match) return { md: undefined, ios: undefined, color: '' }
  if (match.draw) return { ios: reorderTwoOutline, md: reorderTwoSharp, color: 'warning' }
  if (match.winnerTeamId === teamId.value) return { ios: trophyOutline, md: trophySharp, color: 'success' }
  if (match.loserTeamId === teamId.value) return { ios: closeOutline, md: closeSharp, color: 'danger' }
  return { md: undefined, ios: undefined, color: '' }
}
async function registerPlayer() {
  if (!team.value) {
    const message = 'Impossible de s\'inscrire. Aucune équipe n\'est chargée'
    void toastPopup(message)
    console.error(message)
    return
  }
  if (!user.value) {
    const message = 'Impossible de s\'inscrire. Aucun utilisateur n\'est connecté'
    void toastPopup(message)
    console.error(message)
    return
  }

  try {
    await updateUserProfile(user.value.id, { teamId: team.value.id })
    void toastPopup(`L'équipe ${team.value.id} a été enregistrée comme ton équipe`)
  } catch (e) {
    void errorPopup(`Une erreur s'est produite lors de la modification de ton profil`)
    console.error(e)
  }
}
async function unRegisterPlayer() {
  if (!team.value) {
    const message = 'Impossible de s\'inscrire. Aucune équipe n\'est chargée'
    void toastPopup(message)
    console.error(message)
    return
  }
  if (!user.value) {
    const message = 'Impossible de s\'inscrire. Aucun utilisateur n\'est connecté'
    void toastPopup(message)
    console.error(message)
    return
  }
  try {
    await updateUserProfile(user.value.id, { teamId: DEFAULT_TEAM_ID })
    void toastPopup(`Tu es désincrit.e de cette équipe`)
  } catch (e) {
    void errorPopup(`Une erreur s'est produite lors de la modification de ton profil`)
    console.error(e)
  }
}
</script>

<style scoped>
ion-avatar {
  border-color: var(--ion-color-primary);
  color: var(--ion-color-primary);
  border-width: 1px;
  border-style: solid;
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
