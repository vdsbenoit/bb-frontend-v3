<script setup lang="ts">
import type { AttendantTimeSlot, VueFireUserProfile } from '@/types'
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
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  isPlatform,
  useIonRouter,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import {
  closeOutline,
  closeSharp,
  pauseCircleOutline,
  pauseCircleSharp,
  peopleOutline,
  peopleSharp,
} from 'ionicons/icons'
import { computed, onMounted, reactive, ref, toRef, toValue, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import MyActionSheetButton from '@/components/MyActionSheetButton.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig, useAppSettings } from '@/composables/app'
import { useAttendantGroups } from '@/composables/attendantGroup'
import { useGame } from '@/composables/game'
import { useGameMatches } from '@/composables/match'
import { useCanEditGames, useCanRegister, useCanSeeModerationStuff } from '@/composables/rights'
import { useCurrentUserProfile, useMembersOfGroup } from '@/composables/userProfile'
import { DEFAULT_GAME_ID, DEFAULT_GROUP_ID, USER_ROLES } from '@/constants'
import { addAttendant, removeAttendant, setGameNoScores } from '@/utils/game'
import { setMatchNoScores } from '@/utils/match'
import { confirmPopup, errorPopup, toastPopup } from '@/utils/popup'
import { canBeRegistered } from '@/utils/rights'
import { getRoleByValue, getUserName } from '@/utils/userProfile'

// reactive data

const isTogglingNoScores = ref(false)
const edit = reactive({
  isOn: false,
  selectedAttendantGroupId: DEFAULT_GROUP_ID,
  selectedAttendantId: undefined,
})

// composables

const router = useIonRouter()
const gameId = useRouteParams<string>('gameId', DEFAULT_GAME_ID)
const currentUser = useCurrentUserProfile()
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const { data: game, pending: isLoadingGame, error: errorLoadingGame } = useGame(gameId)
const { data: matches, pending: isLoadingMatches, error: errorLoadingMatches } = useGameMatches(gameId)
const canRegister = useCanRegister()
const canEditGameSettings = useCanEditGames()
const canSeeModerationStuff = useCanSeeModerationStuff()

const breaks = computed(() => {
  if (!appConfig.value || !game.value) return []
  return appConfig.value.groupCategories[game.value.groupCategoryId].breaks
})
function getMatch(time: number) {
  if (!matches.value) return null
  return matches.value.find(match => match.time === time)
}

const {
  data: attendantGroups,
  pending: isLoadingAttendantGroups,
  error: errorLoadingAttendantGroups,
} = useAttendantGroups(toRef(edit, 'isOn'), 'exclude', canSeeModerationStuff, currentUser)
const {
  data: attendants,
  pending: isLoadingAttendants,
  error: errorLoadingAttendants,
} = useMembersOfGroup(toRef(edit, 'selectedAttendantGroupId'))

watch([errorLoadingGame, errorLoadingMatches, errorLoadingAttendantGroups, errorLoadingAttendants], (errors) => {
  if (errors[0]) {
    console.error('Error loading game:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading matches:', errors[1])
  }
  if (errors[2]) {
    console.error('Error loading attendant groups:', errors[2])
  }
  if (errors[3]) {
    console.error('Error loading attendants:', errors[3])
  }
})

// lifecycle hooks

onMounted(() => {
  if (gameId.value === DEFAULT_GAME_ID) {
    const msg = 'Game ID missing from the url'
    void toastPopup(msg)
    console.error(msg)
  }
})

// Computed
const pageTitle = computed(() => {
  if (game.value) return `Épreuve ${gameId.value}`
  if (isLoadingGame.value) return 'Chargement'
  return 'Épreuve inconnue'
})
const playerSchedule = computed(() => {
  if (!appConfig.value) return []
  return appConfig.value.playerSchedule
})
const attendantSchedule = computed(() => appConfig.value?.attendantSchedule ?? [])
const isUserRegisteredHere = computed(() => {
  if (!currentUser.value) return false
  if (!currentUser.value.games) return false
  return Object.values(currentUser.value.games)
    .map(game => game.id)
    .includes(gameId.value)
})

// Methods

/**
 * This function is passed as a callback func of the action sheet button
 * @param result Action sheet result. The selection the action sheet is stored in result.data
 * @param payload Payload passed to the action sheet
 */
async function register(result: any, payload: any) {
  const _timeSlot = result.data as AttendantTimeSlot
  const _targetUser = toValue(payload.targetUser) as VueFireUserProfile
  const _currentUser = toValue(currentUser)
  const _game = toValue(game)

  // arguments checks
  if (!_game) throw new Error('Undefined game')
  if (!_currentUser) throw new Error('User is not connected')
  if (!_targetUser) throw new Error('Undefined target user')
  if (!appSettings.value) throw new Error('Undefined appSettings')
  if (!appConfig.value) throw new Error('Undefined appConfig')

  const maxGameAttendants = appSettings.value.maxGameAttendants
  const isCurrentUser = _targetUser.id === _currentUser.id
  let currentAttendantsIds: string[] = []
  if (_game.attendants[_timeSlot.id]) {
    currentAttendantsIds = _game.attendants[_timeSlot.id].map(attendant => attendant.id)
  }

  try {
    // applicability checks
    if (!isCurrentUser && !canRegister.group) {
      throw new Error(`
      Tu n'as pas le droit d'inscrire quelqu'un d'autre à une épreuve.
      Le rôle minimum pour inscrire quelqu'un est ${getRoleByValue(USER_ROLES.Chef)}
    `)
    }
    if (_targetUser.groupId !== _currentUser.groupId && !canRegister.anyone) {
      throw new Error(`
      L'utilisateur ${getUserName(_targetUser)} ne fait pas partie de ta section.
      Seuls les organisateurs peuvent assigner n'importe qui à une épreuve
    `)
    }
    // if target user is not an attendant
    if (!canBeRegistered(_targetUser)) {
      throw new Error(`
      Le rôle de ${getUserName(_targetUser)} est ${getRoleByValue(_targetUser.role)}.
      Seuls les ${getRoleByValue(USER_ROLES.Animateur)} et les ${getRoleByValue(
        USER_ROLES.Chef,
      )} peuvent être inscrit à une épreuve
    `)
    }
    // if target user is already registered in another game
    if (currentAttendantsIds.includes(_targetUser.id)) {
      throw new Error(
        isCurrentUser
          ? `Tu es déjà inscrit.e à l'épreuve ${_game.id} au timing ${_timeSlot.name}`
          : `${getUserName(_targetUser)} est déjà inscrit.e au timing ${_timeSlot.name} de l'épreuve ${_game.id}`,
      )
    }
    // if max attendants reached
    if (currentAttendantsIds.length >= maxGameAttendants) {
      throw new Error(`
      Le nombre maximum d'animateurs a été atteint au timing ${_timeSlot.name} de l'épreuve ${_game.id}
    `)
    }
    // if target user is busy at target timing
    if (_targetUser.games && _timeSlot.id in _targetUser.games && _targetUser.games[_timeSlot.id]) {
      const currentGameId = _targetUser.games[_timeSlot.id].id
      const message = isCurrentUser
        ? `Tu es déjà inscrit.e à l'épreuve ${currentGameId} au timing ${_timeSlot.name}. Veux-tu te désincrire ?`
        : `${getUserName(_targetUser)} est déjà inscrit.e à l'épreuve ${currentGameId} au timing ${
          _timeSlot.name
        }. Le/la désincrire ?`
      void confirmPopup(
        message,
        async () => {
          await removeAttendant(currentGameId, _targetUser.id, _timeSlot.id).then(() => {
            void toastPopup(`Désinscription à l'épreuve ${currentGameId} effectuée`)
          })
          await addAttendant(_game.id, _targetUser.id, _timeSlot.id).then(() => {
            void toastPopup('Responsables mis à jour')
          })
        },
        () => void toastPopup('Enregistrement annulé'),
      )
    } else {
      await addAttendant(_game.id, _targetUser.id, _timeSlot.id).then(() => {
        void toastPopup('Responsables mis à jour')
      })
    }
  } catch (e: any) {
    void toastPopup(e.message)
    console.error(e)
  }
}

/**
 * Unregister the current user from all games
 */
async function unregister() {
  // arguments checks
  if (!currentUser.value) return void errorPopup('Current user data not found')

  for (const timeSlot of attendantSchedule.value) {
    await removeAttendant(gameId.value, currentUser.value.id, timeSlot.id).then(() => {
      void toastPopup(`Désinscription à l'épreuve ${gameId.value} effectuée`)
    })
  }
}

function getTeamIdClass(time: number, playerIndex: number): string {
  const match = getMatch(time)
  if (!match) return 'no-score'
  if (match.draw) return 'draw has-score'
  if (match.winnerTeamId === match.playerTeamIds[playerIndex]) return 'winner has-score'
  if (match.loserTeamId === match.playerTeamIds[playerIndex]) return 'loser has-score'
  return 'no-score'
}

function toggleEditMode() {
  edit.isOn = !edit.isOn
}

function goToProfile(uid: string) {
  if (!edit.isOn) router.push(`/profile/${uid}`)
}

async function toggleNoScores() {
  if (!game.value) {
    void toastPopup('Game is undefined')
    console.error('Cannot toggle no scores, game is undefined', game)
    return
  }
  isTogglingNoScores.value = true
  const newValue = !game.value.noScores
  const promises = []
  promises.push(
    setGameNoScores(gameId.value, newValue)
      .then(() => {
        void toastPopup(`Les scores de l'épreuve ${gameId.value} ont été ${newValue ? 'activés' : 'désactivés'}`)
      })
      .catch((e) => {
        void errorPopup(`Impossible de ${newValue ? 'réactiver' : 'désactiver'} les scores de l'épreuve ${gameId.value}`)
        console.error(`Error : cannot update game ${gameId.value} `, e)
      }),
  )
  game.value.matches.forEach(matchId => promises.push(setMatchNoScores(matchId, newValue)))
  await Promise.all(promises).then(() =>
    console.log(`Les scores des matchs de l'épreuve ${gameId.value} ont été ${newValue ? 'activés' : 'désactivés'}`),
  )
  isTogglingNoScores.value = false
}
</script>

<template>
  <IonPage>
    <HeaderComponent :page-title="pageTitle" />
    <IonContent :fullscreen="true">
      <RefresherComponent />
      <div v-if="isLoadingGame" class="ion-text-center">
        <IonSpinner />
      </div>
      <div v-else-if="errorLoadingGame" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <IonText color="error">
          Impossible de charger le jeu
        </IonText>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else-if="!game" class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette épreuve...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else>
        <IonGrid class="ion-padding-horizontal ion-padding-top">
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-padding-start">
              <IonCardSubtitle>Circuit {{ game.circuit }}</IonCardSubtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">
                {{ game.name }}
              </h1>
            </IonCol>
            <IonCol class="numberCircle ion-padding-end">
              <span>
                {{ gameId }}
              </span>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Responsables</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList
              v-for="timeSlot in attendantSchedule"
              :key="timeSlot.id"
              lines="none"
              class="ion-no-margin ion-no-padding"
            >
              <IonText color="primary">
                <h2>{{ timeSlot.name }}</h2>
              </IonText>
              <span
                v-if="!game.attendants[timeSlot.id] || game.attendants[timeSlot.id].length < 1"
                class="ion-padding-start"
              >Pas encore de responsable inscrit</span>
              <IonItem v-for="attendant in game.attendants[timeSlot.id]" v-else :key="attendant.id">
                <IonLabel class="ion-text-wrap" @click="goToProfile(attendant.id)">
                  <IonText style="font-weight: bold">
                    {{ attendant.name }}
                  </IonText>
                  <IonText color="medium"> &nbsp;({{ attendant.groupName ?? '' }}) </IonText>
                </IonLabel>
                <IonIcon
                  v-if="edit.isOn"
                  :ios="closeOutline"
                  :md="closeSharp"
                  @click="removeAttendant(gameId, attendant.id, timeSlot.id)"
                />
              </IonItem>
            </IonList>
            <IonGrid class="ion-margin-top">
              <IonRow>
                <IonCol v-if="canRegister.itself" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                  <MyActionSheetButton
                    expand="block"
                    color="primary"
                    action-sheet-header="Quand ?"
                    :buttons="attendantSchedule.map(timeSlot => ({ text: timeSlot.name, data: timeSlot }))"
                    :callback="register"
                    :payload="{ targetUser: currentUser }"
                  >
                    M'inscrire
                  </MyActionSheetButton>
                </IonCol>
                <IonCol
                  v-if="canRegister.itself && isUserRegisteredHere"
                  size="12"
                  size-sm="6"
                  class="ion-no-padding ion-padding-horizontal"
                >
                  <IonButton expand="block" color="danger" @click="unregister">
                    Se désinscrire
                  </IonButton>
                </IonCol>
                <IonCol
                  v-if="canRegister.group || canRegister.anyone"
                  size="12"
                  size-sm="6"
                  class="ion-no-padding ion-padding-horizontal"
                >
                  <IonButton expand="block" :color="edit.isOn ? 'medium' : 'tertiary'" @click="toggleEditMode">
                    {{ edit.isOn ? 'Arrêter la modification' : 'Modifier les animateurs' }}
                  </IonButton>
                </IonCol>
                <IonCol v-if="canEditGameSettings" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                  <IonButton v-if="isTogglingNoScores" expand="block" color="medium">
                    <IonSpinner />
                  </IonButton>
                  <IonButton v-else-if="game.noScores" expand="block" color="success" @click="toggleNoScores">
                    Réactiver les scores
                  </IonButton>
                  <IonButton v-else expand="block" color="danger" @click="toggleNoScores">
                    Désactiver les scores
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        <IonCard v-if="edit.isOn">
          <IonCardHeader>
            <IonCardTitle>Enregistrer un animateur</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid class="">
              <IonRow>
                <IonCol size="12" size-sm="6">
                  <IonSpinner v-if="isLoadingAttendantGroups" />
                  <div v-if="errorLoadingAttendantGroups" class="ion-text-center">
                    <strong class="capitalize ion-text-center">Erreur</strong>
                    <IonText color="error">
                      Impossible de charger les groupes d'animateurs
                    </IonText>
                  </div>
                  <IonSelect
                    v-else-if="attendantGroups && attendantGroups.length > 0"
                    v-model="edit.selectedAttendantGroupId"
                    placeholder="Choisir section"
                    interface="action-sheet"
                  >
                    <IonSelectOption v-for="group in attendantGroups" :key="group.id" :value="group.id">
                      {{ group.name }} ({{ group.city }})
                    </IonSelectOption>
                  </IonSelect>
                  <div v-else class="ion-text-center ion-padding-top">
                    Aucune section trouvée
                  </div>
                </IonCol>
                <IonCol v-if="edit.selectedAttendantGroupId !== DEFAULT_GROUP_ID" size="12" size-sm="6">
                  <IonSpinner v-if="isLoadingAttendants" />
                  <div v-if="errorLoadingAttendants" class="ion-text-center">
                    <strong class="capitalize ion-text-center">Erreur</strong>
                    <IonText color="error">
                      Impossible de charger les animateurs
                    </IonText>
                  </div>
                  <IonSelect
                    v-else-if="attendants && attendants.length > 0"
                    v-model="edit.selectedAttendantId"
                    placeholder="Choisir animateur"
                    interface="action-sheet"
                  >
                    <IonSelectOption
                      v-for="attendant in attendants"
                      :key="attendant.id"
                      color="dark"
                      :value="attendant"
                    >
                      {{ getUserName(attendant) }}
                    </IonSelectOption>
                  </IonSelect>
                  <p v-else class="ion-text-center ion-padding-top">
                    Aucun animateur trouvé
                  </p>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol
                  v-if="edit.selectedAttendantId"
                  size="12"
                  size-sm="6"
                  class="ion-no-padding ion-padding-horizontal"
                >
                  <MyActionSheetButton
                    expand="block"
                    color="primary"
                    action-sheet-header="Quand ?"
                    :buttons="attendantSchedule.map(timeSlot => ({ text: timeSlot.name, data: timeSlot }))"
                    :callback="register"
                    :payload="{ targetUser: edit.selectedAttendantId }"
                  >
                    Inscrire {{ getUserName(edit.selectedAttendantId) }}
                  </MyActionSheetButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Programme</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div v-if="isLoadingMatches" class="ion-text-center">
              <IonSpinner />
            </div>
            <div v-else-if="errorLoadingMatches" class="ion-text-center">
              <strong class="capitalize">Erreur</strong>
              <IonText color="error">
                Impossible de charger les duels
              </IonText>
            </div>
            <IonListHeader v-else-if="matches && matches.length === 0">
              <h2>Aucun duel trouvé</h2>
            </IonListHeader>
            <IonList v-else>
              <div v-for="[i, timeSlot] in playerSchedule.entries()" :key="i">
                <IonItem
                  v-if="Object.keys(breaks).includes(i.toString())"
                  :class="{ 'item-no-padding': isPlatform('ios') }"
                >
                  <IonLabel class="ion-text-wrap">
                    <IonIcon
                      :ios="pauseCircleOutline"
                      :md="pauseCircleSharp"
                      style="vertical-align: middle"
                      class="schedule-icon ion-margin-end"
                    />
                    <IonText class="time-slot ion-margin-end"> {{ timeSlot.start }} - {{ timeSlot.stop }} </IonText>
                    <IonText color="primary" class="team-id pause">
                      {{ breaks[i] }}
                    </IonText>
                  </IonLabel>
                </IonItem>
                <IonItem
                  v-else
                  :router-link="`/match/${getMatch(i)?.id}`"
                  router-direction="forward"
                  :class="{ 'item-no-padding': isPlatform('ios') }"
                >
                  <IonLabel class="ion-text-wrap">
                    <IonIcon
                      :ios="peopleOutline"
                      :md="peopleSharp"
                      style="vertical-align: middle"
                      class="schedule-icon ion-margin-end"
                    />
                    <IonText class="time-slot ion-margin-end"> {{ timeSlot.start }} - {{ timeSlot.stop }} </IonText>
                    <IonText class="team-id" :class="[getTeamIdClass(i, 0)]">
                      {{ getMatch(i)?.playerTeamIds[0] }}
                    </IonText>
                    <IonText class="separator">
                      {{ getMatch(i)?.draw ? ' = ' : ' vs ' }}
                    </IonText>
                    <IonText class="team-id" :class="[getTeamIdClass(i, 1)]">
                      {{ getMatch(i)?.playerTeamIds[1] }}
                    </IonText>
                  </IonLabel>
                </IonItem>
              </div>
            </IonList>
          </IonCardContent>
        </IonCard>
      </div>
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
  width: 100%;
  text-align: center;
  justify-content: center;
  color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-dark);
  /* Set full opacity on the placeholder */
  --placeholder-opacity: 1;
}
.team-id {
  font-weight: bold;
  font-size: 15px;
  min-width: 42px;
  display: inline-block;
  border-radius: 10px;
  text-align: center;
}
.no-score {
  color: var(--ion-color-primary);
}
.has-score {
  color: var(--ion-color-light);
}
.winner {
  /* this class is applied to an ion-text to make it look like an ion-badge with a success background */
  background-color: var(--ion-color-success);
}
.loser {
  background-color: var(--ion-color-danger);
}
.draw {
  background-color: var(--ion-color-warning);
}
.separator {
  min-width: 25px;
  display: inline-block;
  text-align: center;
}
.pause {
  margin-left: 8px;
}
</style>
