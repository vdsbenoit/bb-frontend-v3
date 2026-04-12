<template>
  <ion-page>
    <header-component :page-title="pageTitle" />
    <ion-content :fullscreen="true">
      <refresher-component />
      <div v-if="errorLoadingMatch" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <ion-text color="error">
          Impossible de charger les informations du match
        </ion-text>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else-if="!match" class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé ce duel...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else>
        <ion-grid class="ion-padding-horizontal ion-padding-top" @click="router.push(`/game/${match.gameId}`)">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <div class="ion-align-items-center ion-justify-content-start" style="display: flex">
                <ion-card-subtitle class="ion-no-margin">
                  {{ schedule.start }} - {{ schedule.stop }}
                </ion-card-subtitle>
                <ion-button
                  fill="clear"
                  class="ion-no-padding ion-no-margin ion-margin-start"
                  size="small"
                  :router-link="`/game/${match.gameId}`"
                  router-direction="root"
                >
                  Voir le jeu
                </ion-button>
              </div>
              <ion-spinner v-if="isLoadingGame" />
              <h1 v-else-if="errorLoadingGame" class="ion-no-margin">
                <i>Erreur</i>
              </h1>
              <h1 v-else-if="game" class="ion-no-margin" style="font-weight: bold">
                {{ game.name ?? 'Epreuve sans nom' }}
              </h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <ion-spinner v-if="isLoadingGame" />
              <span v-else>{{ game ? game.id : '?' }}</span>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card>
          <ion-card-content class="ion-no-padding ion-padding-vertical">
            <ion-grid class="score-grid">
              <ion-row class="ion-align-items-center ion-text-center">
                <!-- First player -->
                <ion-col v-if="isLoadingMatch || isLoadingFirstPlayer" size="5" class="ion-no-padding">
                  <ion-spinner />
                </ion-col>
                <ion-col
                  v-else-if="firstPlayer"
                  size="5"
                  class="ion-no-padding ion-pointer"
                  @click="router.push(`/team/${firstPlayer.id}`)"
                >
                  <ion-text color="primary">
                    <h1>{{ firstPlayer.id }}</h1>
                  </ion-text>
                  <ion-text color="dark">
                    <p>{{ firstPlayer.groupName }}</p>
                  </ion-text>
                  <ion-text color="medium">
                    <p>{{ firstPlayer.groupCity }}</p>
                  </ion-text>
                </ion-col>
                <ion-col size="1">
                  <ion-text> vs </ion-text>
                </ion-col>
                <!-- Second player -->
                <ion-col v-if="isLoadingMatch || isLoadingSecondPlayer" size="5" class="ion-no-padding">
                  <ion-spinner />
                </ion-col>
                <ion-col
                  v-else-if="secondPlayer"
                  size="5"
                  class="ion-no-padding ion-pointer"
                  @click="router.push(`/team/${secondPlayer.id}`)"
                >
                  <ion-text color="primary">
                    <h1>{{ secondPlayer.id }}</h1>
                  </ion-text>
                  <ion-text color="dark">
                    <p>{{ secondPlayer.groupName }}</p>
                  </ion-text>
                  <ion-text color="medium">
                    <p>{{ secondPlayer.groupCity }}</p>
                  </ion-text>
                </ion-col>
              </ion-row>
              <!-- Score icons -->
              <ion-row v-if="match.draw" class="ion-align-items-center ion-text-center">
                <ion-col size="11">
                  <div class="score-div draw">
                    <span class="draw ion-text-uppercase">égalité</span>
                  </div>
                </ion-col>
              </ion-row>
              <ion-row v-if="match.winnerTeamId && firstPlayer && secondPlayer">
                <ion-col size="5">
                  <div class="score-div" :class="scoreColor(firstPlayer.id)">
                    <ion-icon
                      class="score-icon"
                      :ios="scoreIcon(firstPlayer.id).ios"
                      :md="scoreIcon(firstPlayer.id).md"
                    />
                  </div>
                </ion-col>
                <ion-col size="1" />
                <ion-col size="5">
                  <div class="score-div" :class="scoreColor(secondPlayer.id)">
                    <ion-icon
                      class="score-icon"
                      :ios="scoreIcon(secondPlayer.id).ios"
                      :md="scoreIcon(secondPlayer.id).md"
                    />
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
        <ion-card v-if="useCanSeeModeration">
          <ion-card-header>
            <ion-card-title>Modération</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="reporterId" lines="none" class="no-pointer">
              <ion-item class="ion-no-padding" style="--padding-start: 8px">
                <ion-label>
                  <ion-text>Modififé par : </ion-text>
                  <ion-spinner v-if="isLoadingReporter" />
                  <ion-text v-else-if="reporter" class="ion-text-wrap">
                    {{ reporter.name }} ({{ reporter.groupName }})
                  </ion-text>
                  <ion-text v-else color="error"> Impossible de charger le profil </ion-text>
                </ion-label>
              </ion-item>
              <ion-item class="ion-no-padding" style="--padding-start: 8px">
                <ion-label> Modifié à : {{ formatedDate }} </ion-label>
              </ion-item>
            </ion-list>
            <ion-list-header v-else>
              <h2>Le score n'a pas encore été enregistré</h2>
            </ion-list-header>
          </ion-card-content>
        </ion-card>
        <div v-if="canEditScores" class="ion-margin-top" style="max-width: 600px; margin: 0 auto">
          <ion-button
            v-if="match.noScores"
            class="ion-margin-horizontal ion-margin-top"
            color="medium"
            expand="block"
            disabled
          >
            Pas de score pour ce jeu
          </ion-button>
          <ion-button
            v-else
            class="ion-margin-horizontal ion-margin-top"
            expand="block"
            :disabled="isSettingScore"
            @click="setScore"
          >
            <ion-spinner v-if="isSettingScore" />
            <span v-else-if="match.winnerTeamId || match.draw">Modifier le score</span>
            <span v-else>Enregister le score</span>
          </ion-button>
          <ion-button
            v-if="isResettingScore"
            color="danger"
            class="ion-margin-horizontal ion-margin-top"
            expand="block"
            disabled
          >
            <ion-spinner />
          </ion-button>
          <ion-button
            v-else-if="match.winnerTeamId || match.draw"
            color="danger"
            class="ion-margin-horizontal ion-margin-top"
            expand="block"
            @click="resetScore"
          >
            Effacer le score
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import type { FirestoreError } from 'firebase/firestore'
import {
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
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  useIonRouter,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import { closeOutline, closeSharp, trophyOutline, trophySharp } from 'ionicons/icons'
import { computed, onMounted, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig, useAppSettings } from '@/composables/app'
import { useGame } from '@/composables/game'
import { useMatch } from '@/composables/match'
import { useCanSeeModerationStuff, useEditScoreRights } from '@/composables/rights'
import { useTeam } from '@/composables/team'
import { useCurrentUserProfile, useUserProfile } from '@/composables/userProfile'
import { DEFAULT_GAME_ID, DEFAULT_MATCH_ID, DEFAULT_TEAM_ID, DEFAULT_USER_ID } from '@/constants'
import { resetMatchScore, setMatchDraw, setMatchScore } from '@/utils/match'
import { addGroupDraw, addGroupWin, removeGroupDraw, removeGroupWin } from '@/utils/playerGroup'
import { choicePopup, errorPopup, toastPopup } from '@/utils/popup'
import { addTeamDraw, addTeamWin, removeTeamDraw, removeTeamWin } from '@/utils/team'

// Composables

const router = useIonRouter()
const matchId = useRouteParams<string>('matchId', DEFAULT_MATCH_ID)
const { data: match, pending: isLoadingMatch, error: errorLoadingMatch } = useMatch(matchId)
const gameId = computed(() => match.value?.gameId ?? DEFAULT_GAME_ID)
const { data: game, pending: isLoadingGame, error: errorLoadingGame } = useGame(gameId)
const playerId0 = computed(() => match.value?.playerTeamIds[0] ?? DEFAULT_TEAM_ID)
const playerId1 = computed(() => match.value?.playerTeamIds[1] ?? DEFAULT_TEAM_ID)
const { data: firstPlayer, pending: isLoadingFirstPlayer, error: errorLoadingFirstPlayer } = useTeam(playerId0)
const { data: secondPlayer, pending: isLoadingSecondPlayer, error: errorLoadingSecondPlayer } = useTeam(playerId1)
const { canEditScores } = useEditScoreRights(game)
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const useCanSeeModeration = useCanSeeModerationStuff()
const userProfile = useCurrentUserProfile()

// reactive data

const isSettingScore = ref(false)
const isResettingScore = ref(false)

// lifecycle hooks

onMounted(() => {
  if (matchId.value === DEFAULT_MATCH_ID) {
    const msg = 'Match ID missing from the url'
    toastPopup(msg)
    console.error(msg)
  }
})

// Computed

const pageTitle = computed(() => {
  if (isLoadingMatch.value) return 'Chargement...'
  if (match.value) return `Duel ${match.value.playerTeamIds[0]} vs ${match.value.playerTeamIds[1]}`
  return 'Duel inconnu'
})

const schedule = computed(() => {
  if (appConfig.value && match.value) {
    return appConfig.value.playerSchedule[match.value.time]
  }
  return { start: '', stop: '' }
})
const reporterId = computed(() => {
  if (!useCanSeeModeration.value) return DEFAULT_USER_ID // to prevent any unnecessary db calls
  if (!match.value || !match.value.reporter) return DEFAULT_USER_ID
  return match.value.reporter
})
const { data: reporter, pending: isLoadingReporter, error: errorLoadingReporter } = useUserProfile(reporterId)
const formatedDate = computed(() => {
  if (match.value && match.value.lastModified) {
    const date = new Date(match.value.lastModified)
    return date.toLocaleString('fr-BE')
  }
  return ''
})

// Methods

async function winHandler(winnerTeamId: string) {
  if (!userProfile.value) {
    isSettingScore.value = false
    console.error(`userProfile is undefined`)
    return errorPopup('L\'utilisateur n\'est pas connecté')
  }
  if (!match.value) {
    isSettingScore.value = false
    console.error(`match is undefined`)
    return errorPopup('Le match n\'a pas encore été chargé')
  }
  if (match.value.winnerTeamId === winnerTeamId) {
    isSettingScore.value = false
    return errorPopup(`L'équipe ${winnerTeamId} est déjà enregistrée comme gagnante`)
  }
  let winningGroupId: string
  let losingGroupId: string
  const promises = []
  const loser
    = match.value.playerTeamIds[0] === winnerTeamId ? match.value.playerTeamIds[1] : match.value.playerTeamIds[0]
  if (!firstPlayer.value || !secondPlayer.value) {
    isSettingScore.value = false
    console.error(`firstPlayer or secondPlayer is undefined`, firstPlayer.value, secondPlayer.value)
    return errorPopup(`Le match n'a pas encore été chargé`)
  }
  if (firstPlayer.value.id === winnerTeamId) {
    winningGroupId = firstPlayer.value.groupId
    losingGroupId = secondPlayer.value.groupId
  } else {
    winningGroupId = secondPlayer.value.groupId
    losingGroupId = firstPlayer.value.groupId
  }
  try {
    // if a scores was already set, remove it
    if (match.value.winnerTeamId) {
      promises.push(removeTeamWin(loser))
      promises.push(removeGroupWin(losingGroupId))
    }
    // if a scores was already set, remove it
    if (match.value.draw) {
      promises.push(removeTeamDraw(winnerTeamId))
      promises.push(removeTeamDraw(loser))
      promises.push(removeGroupDraw(winningGroupId))
      promises.push(removeGroupDraw(losingGroupId))
    }
    // set the new score
    promises.push(addTeamWin(winnerTeamId))
    promises.push(addGroupWin(winningGroupId))
    promises.push(setMatchScore(matchId.value, winnerTeamId, loser, userProfile.value.id))

    await Promise.all(promises)
    toastPopup('Le score a été enregistré')
  } catch (error: any) {
    errorPopup('Veuillez contacter l\'administrateur de l\'app', `L'enregistrement du score a échoué`)
    console.error('Cannot set score.', error.message)
  }
  isSettingScore.value = false
}
async function drawHandler() {
  if (!userProfile.value) {
    isSettingScore.value = false
    console.error(`userProfile is undefined`)
    return errorPopup('L\'utilisateur n\'est pas connecté')
  }
  if (!match.value) {
    isSettingScore.value = false
    console.error(`match is undefined`)
    return errorPopup('Le match n\'a pas encore été chargé')
  }
  if (match.value.draw) {
    isSettingScore.value = false
    return errorPopup('Ce duel est déjà enregistré comme égalité')
  }
  const promises = []
  if (!firstPlayer.value || !secondPlayer.value) {
    isSettingScore.value = false
    console.error(`firstPlayer or secondPlayer is undefined`, firstPlayer.value, secondPlayer.value)
    return errorPopup(`Le match n'a pas encore été chargé`)
  }
  try {
    if (match.value.winnerTeamId) {
      const previousWinningGroupId
        = firstPlayer.value.id === match.value.winnerTeamId ? firstPlayer.value.groupId : secondPlayer.value.groupId
      promises.push(removeTeamWin(match.value.winnerTeamId))
      promises.push(removeGroupWin(previousWinningGroupId))
    }
    promises.push(addTeamDraw(firstPlayer.value.id as string))
    promises.push(addTeamDraw(secondPlayer.value.id as string))
    promises.push(addGroupDraw(firstPlayer.value.groupId))
    promises.push(addGroupDraw(secondPlayer.value.groupId))
    promises.push(setMatchDraw(matchId.value, userProfile.value.id))

    await Promise.all(promises)
    toastPopup('Le score a été enregistré')
  } catch (error: any) {
    errorPopup(error.message, `L'enregistrement du score a échoué`)
    console.log(error)
  }
  isSettingScore.value = false
}

function setScore() {
  if (!match.value) {
    isSettingScore.value = false
    console.error(`match is undefined`)
    return errorPopup('Le match n\'a pas encore été chargé')
  }
  if (!appSettings.value?.canSetScores) {
    errorPopup('Il n\'est pas ou plus possible d\'enregistrer des scores')
    return
  }
  isSettingScore.value = true
  choicePopup(
    'Est-ce une victoire ?',
    ['Victoire', 'Égalité'],
    (choice: string) => {
      if (choice === 'Égalité') {
        drawHandler()
      } else if (choice === 'Victoire') {
        choicePopup(
          'Qui est l\'heureux gagnant ?',
          [match.value?.playerTeamIds[0] ?? '', match.value?.playerTeamIds[1] ?? ''],
          winHandler,
          'score-choice-popup',
        )
      } else {
        console.error(`Unknown choice: ${choice}`)
      }
    },
    'score-choice-popup',
  ).then(() => {
    isSettingScore.value = false
  })
}

async function resetScore() {
  if (!match.value) {
    isSettingScore.value = false
    console.error(`match is undefined`)
    return errorPopup('Le match n\'a pas encore été chargé')
  }
  if (!userProfile.value) {
    isSettingScore.value = false
    console.error(`userProfile is undefined`)
    return errorPopup('L\'utilisateur n\'est pas connecté')
  }
  if (!appSettings.value?.canSetScores) {
    errorPopup('Il n\'est pas ou plus possible de modifier des scores')
    return
  }
  if (!match.value.winnerTeamId && !match.value.draw) {
    errorPopup('Ce duel n\'a pas encore de score')
    return
  }
  isResettingScore.value = true
  if (!firstPlayer.value || !secondPlayer.value) {
    isResettingScore.value = false
    console.error(`firstPlayer or secondPlayer is undefined`, firstPlayer.value, secondPlayer.value)
    return errorPopup(`Le match n'a pas encore été chargé`)
  }
  const promises = []
  try {
    if (match.value.winnerTeamId) {
      const previousWinningGroupId
        = firstPlayer.value.id === match.value.winnerTeamId ? firstPlayer.value.groupId : secondPlayer.value.groupId
      promises.push(removeTeamWin(match.value.winnerTeamId))
      promises.push(removeGroupWin(previousWinningGroupId))
    }
    if (match.value.draw) {
      promises.push(removeTeamDraw(firstPlayer.value.id as string))
      promises.push(removeTeamDraw(secondPlayer.value.id as string))
      promises.push(removeGroupDraw(firstPlayer.value.groupId))
      promises.push(removeGroupDraw(secondPlayer.value.groupId))
    }
    promises.push(resetMatchScore(matchId.value, userProfile.value.id))
    await Promise.all(promises)
    toastPopup('Le score a été réinitialisé')
    console.log(`Score reset for match ${matchId.value} by ${userProfile.value.id}`)
  } catch (error: any) {
    errorPopup(error.message, `La réinitialisation du score a échoué`)
    console.log(error)
  }
  isResettingScore.value = false
}

function scoreColor(playerId: string | undefined) {
  if (match.value) {
    if (playerId === match.value.winnerTeamId) return 'winner-color'
    if (playerId === match.value.loserTeamId) return 'loser-color'
  }
  return ''
}
function scoreIcon(playerId: string | undefined) {
  if (match.value) {
    if (playerId === match.value.winnerTeamId) return { ios: trophyOutline, md: trophySharp }
    if (playerId === match.value.loserTeamId) return { ios: closeOutline, md: closeSharp }
  }
  return { md: undefined, ios: undefined }
}

// Watchers

watch(errorLoadingGame, (error: FirestoreError | undefined) => {
  if (error) {
    toastPopup('Erreur lors du chargement du jeu')
    console.error(`Error loading game: ${error.message}`)
  }
})
watch(errorLoadingMatch, (error: FirestoreError | undefined) => {
  if (error) {
    toastPopup('Erreur lors du chargement du match')
    console.error(`Error loading match: ${error.message}`)
  }
})
watch(errorLoadingFirstPlayer, (error: FirestoreError | undefined) => {
  if (error) {
    toastPopup('Erreur lors du chargement de l\'équipe 1')
    console.error(`Error loading first player: ${error.message}`)
  }
})
watch(errorLoadingSecondPlayer, (error: FirestoreError | undefined) => {
  if (error) {
    toastPopup('Erreur lors du chargement de l\'équipe 2')
    console.error(`Error loading second player: ${error.message}`)
  }
})
watch(errorLoadingReporter, (error: FirestoreError | undefined) => {
  if (error) {
    toastPopup('Erreur lors du chargement du modérateur')
    console.error(`Error loading reporter: ${error.message}`)
  }
})
</script>

<style scoped>
.score-grid {
  --ion-grid-columns: 11;
}
.score-div {
  margin-top: 10px;
  height: 30px;
  line-height: 30px;
  width: 100%;
  border-radius: 8px;
  text-align: center;
}
.winner-color {
  background-color: var(--ion-color-success);
}
.loser-color {
  background-color: var(--ion-color-danger);
}
div.draw {
  background-color: var(--ion-color-warning);
  color: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}
span.draw {
  line-height: normal;
  font-weight: bolder;
}
.score-icon {
  color: #dddddd;
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
  height: 65%;
  width: 100%;
}
</style>
