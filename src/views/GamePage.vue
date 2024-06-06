<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"/>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="isLoadingGame" class="ion-text-center">
        <ion-spinner></ion-spinner>
      </div>
      <div v-else-if="errorLoadingGame" class="not-found">
        <strong class="capitalize">Houston, nous avons une erreur</strong>
        <ion-text color="error">{{ errorLoadingGame.message }}</ion-text>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else-if="!isGame" class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette épreuve...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else>
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>Circuit {{ game?.circuit }}</ion-card-subtitle>
              <h1 v-if="game?.name" class="ion-no-margin" style="font-weight: bold">{{ game.name }}</h1>
              <ion-spinner v-else></ion-spinner>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span v-if="gameId">
                {{ gameId }}
              </span>
              <ion-spinner v-else></ion-spinner>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Responsables</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none" class="ion-no-margin ion-no-padding">
              <ion-text color="primary"><h2>Matin</h2></ion-text>
              <ion-spinner v-if="isLoadingMorningLeaders" class="ion-margin-start"></ion-spinner>
              <span class="ion-padding-start" v-else-if="leaders.morning.length < 1">Pas encore de responsable inscrit</span>
              <ion-item v-else v-for="leader in leaders.morning" :key="leader.uid" @click="goToProfile(leader.uid)">
                <ion-label class="ion-text-wrap">
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
                <ion-icon v-if="editMode" :ios="closeOutline" :md="closeSharp" @click="removeLeader(leader.uid, 'morning')"></ion-icon>
              </ion-item>
            </ion-list>
            <ion-list lines="none" class="ion-no-margin ion-no-padding">
              <ion-text color="primary"><h2>Après-midi</h2></ion-text>
              <ion-spinner v-if="isLoadingAfternoonLeaders" class="ion-margin-start"></ion-spinner>
              <span class="ion-padding-start" v-else-if="leaders.afternoon.length < 1">Pas encore de responsable inscrit</span>
              <ion-item v-else v-for="leader in leaders.afternoon" :key="leader.uid" @click="goToProfile(leader.uid)">
                <ion-label class="ion-text-wrap">
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
                <ion-icon v-if="editMode" :ios="closeOutline" :md="closeSharp" @click="removeLeader(leader.uid, 'afternoon')"></ion-icon>
              </ion-item>
            </ion-list>

            <ion-grid class="ion-margin-top">
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canRegister && !isMorningLeader">
                  <ion-button @click="register('morning')" expand="block" color="primary" :disabled="isRegistering">
                    <ion-spinner v-if="isRegistering"></ion-spinner>
                    <span v-else>Je m'inscris au matin</span>
                    </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canRegister && !isAfternoonLeader">
                  <ion-button @click="register('afternoon')" expand="block" color="primary" :disabled="isRegistering">
                    <ion-spinner v-if="isRegistering"></ion-spinner>
                    <span v-else>Je m'inscris l'après-midi</span>
                    </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canRegister && (isMorningLeader || isAfternoonLeader)">
                  <ion-button @click="unRegister" expand="block" color="danger" :disabled="isUnregistering">
                    <ion-spinner v-if="isUnregistering"></ion-spinner>
                    <span v-else>Se désinscrire</span>
                  </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canEditLeaders">
                  <ion-button v-if="editMode" @click="toggleLeadersEditMode" expand="block" color="medium" > Arrêter la modification </ion-button>
                  <ion-button v-else @click="toggleLeadersEditMode" expand="block" color="tertiary" > Modifier les animateurs </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canEditGameSettings">
                  <ion-button v-if="isTogglingNoScores" expand="block" color="medium" > 
                    <ion-spinner></ion-spinner>
                  </ion-button>
                  <div v-else-if="game">
                    <ion-button v-if="game.noScores" @click="toggleNoScores" expand="block" color="success" > Réactiver les scores </ion-button>
                    <ion-button v-else @click="toggleNoScores" expand="block" color="danger" > Désactiver les scores </ion-button>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
         <ion-card v-if="editMode">
          <ion-card-header>
            <ion-card-title>Enregistrer un animateur</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid class="">
              <ion-row>
                <ion-col size="12" size-sm="6">
                  <ion-select v-model="selectedLeaderSection" interface="popover" placeholder="Choisir section">
                    <ion-select-option v-for="section in leaderSections" :value="section.id" :key="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
                  </ion-select>
                </ion-col>
                <ion-col size="12" size-sm="6" v-if="selectedLeaderSection">
                    <ion-spinner v-if="isLoadingLeaders"></ion-spinner>
                    <ion-select v-else v-model="selectedLeaderId" placeholder="Choisir animateur" interface="popover">
                      <ion-select-option color="dark" v-for="leader in sectionLeaders?.values()" :value="leader.uid" :key="leader.uid"> {{ currentUser.getName(leader.uid) }} </ion-select-option>
                    </ion-select>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="selectedLeaderId">
                  <ion-button @click="registerMorningLeader" expand="block" color="primary" :disabled="isRegistering">
                    <ion-spinner v-if="isRegistering"></ion-spinner>
                    <span v-else>Ajouter {{ currentUser.getName(selectedLeaderId) }} au matin </span>
                  </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="selectedLeaderId">
                  <ion-button @click="registerAfternoonLeader" expand="block" color="primary" :disabled="isRegistering">                   
                    <ion-spinner v-if="isRegistering"></ion-spinner>
                    <span v-else>Ajouter {{ currentUser.getName(selectedLeaderId) }} l'après-midi </span>
                   </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="matches && matches.size > 0">
              <ion-item v-for="match in matches.values()" :key="match.id" :routerLink="`/match/${match.id}`" class="item-no-padding">
                <ion-label>
                  <ion-text>⌚ {{ getSchedule(match.time - 1).start }} - {{ getSchedule(match.time - 1).stop }} : </ion-text>
                  <ion-text color="primary" style="font-weight: bold">{{ match.player_ids[0] }}</ion-text>
                  <ion-text> vs </ion-text>
                  <ion-text color="primary" style="font-weight: bold">{{ match.player_ids[1] }}</ion-text>
                </ion-label>
                <ion-badge slot="end" class="ion-no-margin" :color="match.draw ? 'warning' : 'success'" v-if="getWinner(match)">{{ getWinner(match) }}</ion-badge>
              </ion-item>
            </ion-list>
            <div v-else>
              <div v-if="isLoadingMatches" class="ion-text-center">
                <ion-spinner></ion-spinner>
              </div>
              <ion-list-header v-else><h2>Aucun duel trouvé</h2></ion-list-header>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { DEFAULT_GAME_ID, removeAfternoonLeader, removeMorningLeader, setAfternoonLeader, setGameNoScores, setMorningLeader, useGame } from "@/composables/games";
import { useLeaderSection, useLeaderSections } from "@/composables/leaderSections";
import { useGameMatches } from "@/composables/matches";
import { useCanRegister } from "@/composables/rights";
import { useAppConfig, useAppSettings } from "@/composables/settings";
import { useCurrentUserProfile } from "@/composables/userProfile";
import { getLeaderSections, streamLeaderSection } from "@/services/leaderSections";
import { setMatchNoScores, streamGameMatches } from "@/services/matches";
import { errorPopup, loadingPopup, toastPopup } from "@/services/popup";
import { getSchedule, isLeaderRegistrationOpen } from "@/services/settings";
import { ROLES } from "@/services/users";
import {
  IonBadge,
  IonButton,
  IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem, IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonSelect, IonSelectOption,
  IonSpinner,
  IonText,
  useIonRouter
} from "@ionic/vue";
import { computed, reactive, ref } from "@vue/reactivity";
import { useRouteParams } from "@vueuse/router";
import { closeOutline, closeSharp, pencilOutline, pencilSharp } from "ionicons/icons";
import { onMounted, watchEffect } from "vue";

// reactive data

const editMode = ref(false);
// store more information about the leaders than their IDs
type leaderInfo = {
  uid: string;
  name: string | undefined;
  section: string | undefined;
};
const leaders = reactive({
  morning: [] as leaderInfo[],
  afternoon: [] as leaderInfo[],
});
const isLoadingMorningLeaders = ref(false);
const isLoadingAfternoonLeaders = ref(false);
const isRegistering = ref(false);
const isUnregistering = ref(false);
const selectedLeaderSection = ref(-1);
const selectedLeaderId = ref("");
const isTogglingNoScores = ref(false);

// composables

const router = useIonRouter();
const gameId = useRouteParams('gameId', DEFAULT_GAME_ID, { transform: Number })
const { data: game, pending: isLoadingGame, error: errorLoadingGame } = useGame(gameId);
const currentUser = useCurrentUserProfile()
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const matches = useGameMatches(gameId)
const { result: canRegister, reason: cannotRegisterReason } = useCanRegister()

// lifecycle hooks

onMounted(() => {
if (gameId.value === DEFAULT_GAME_ID) {
    const msg = "Game ID missing from the url"
    toastPopup(msg)
    console.error(msg)
  }
});

// Computed

const isGame = computed(() => !errorLoadingGame && game.value && game.value.id)
const timings = computed(() => {
  return appConfig.value?.playerTimings ?? []
})
const leaderSections = computed(() => {
  if (!editMode.value || !currentUser.value) return []; // don't load sections if not in edit mode
  if (currentUser.value.role === ROLES.Chef ) return [ useLeaderSection(currentUser.value.sectionId) ]
  if (currentUser.value.role > ROLES.Chef) return useLeaderSections(false)
});
const sectionLeaders = computed(() => {
  return selectedLeaderSection.value ? currentUser.getSectionMembers(selectedLeaderSection.value) : undefined;
});
const isLoadingLeaders = computed(() => {
  if (selectedLeaderSection.value && !sectionLeaders.value) return true;
  return false;
});
const pageTitle = computed(() => {
  if (isGame.value) return `Épreuve ${gameId.value}`;
  if (isLoadingGame.value) return "Chargement";
  return "Épreuve inconnue";
});
const canEditLeaders = computed(() => {
  return currentUser.value.role >= ROLES.Chef;
});
const canEditGameSettings = computed(() => {
  return currentUser.value.role >= ROLES.Administrateur;
});
const editIcon = computed(() => {
  return editMode.value ? { ios: closeOutline, md: closeSharp } : { ios: pencilOutline, md: pencilSharp };
});
const isMorningLeader = computed(() => {
  return game.value?.morningLeaders.includes(currentUser.value.uid) ?? false
});
const isAfternoonLeader = computed(() => {
  return game.value?.afternoonLeaders.includes(currentUser.value.uid) ?? false
});

// Watchers

// async update morning leaders information
watchEffect(async () => {
  if (!isGame.value) return; // do not run this watcher if game is not initialized
  const newLeaderIds = game.value?.morningLeaders ?? [];
  isLoadingMorningLeaders.value = true;
  const newLeaders = await loadLeaderInfo(newLeaderIds);
  leaders.morning = newLeaders;
  isLoadingMorningLeaders.value = false;
  console.log("Morning leaders info updated", newLeaders);
});
// async update morning leaders information
watchEffect(async () => {
  if (!isGame.value) return; // do not run this watcher if game is not initialized
  const newLeaderIds = game.value?.afternoonLeaders ?? [];
  isLoadingAfternoonLeaders.value = true;
  const newLeaders = await loadLeaderInfo(newLeaderIds);
  leaders.afternoon = newLeaders;
  isLoadingAfternoonLeaders.value = false;
  console.log("Afternoon leaders info updated", newLeaders);
});

// Methods

const loadLeaderInfo = async (newLeaderIds: string[]) => {
  const leaderInfo = [] as leaderInfo[];
  await Promise.all(
    newLeaderIds.map(async (leaderId) => {
      await currentUser.asyncFetchProfile(leaderId);
      const section = currentUser.getProfile(leaderId).sectionName;
      const name = currentUser.getName(leaderId);
      leaderInfo.push({ uid: leaderId, name, section });
    })
  );
  return leaderInfo;
};
const register = async (timeSlot: string) => {
  isRegistering.value = true;
  try {
    switch (timeSlot) {
      case "morning":
        await setMorningLeader(game);
        break;
      case "afternoon":
        await setAfternoonLeader(game);
        break;
      default:
        new Error(`Invalid time slot ${timeSlot}`);
        break;
    }
  } catch (error: any) {
    errorPopup(error.message);
    console.error(error);
  }
  isRegistering.value = false;
};
const registerMorningLeader = async () => {
  isRegistering.value = true;
  if (!currentUser.value)
  // prettier-ignore
  if (currentUser.value?.uid !== selectedLeaderId.value && currentUser.value?.role < ROLES.Chef) throw new Error(
    `Tu n'as pas le droit d'assigner des gens à un jeu. `+
    `Le rôle minimum pour inscrire quelqu'un à une épreuve est ${getRoleByValue(5)}`
  )
  await setMorningLeader(game, selectedLeaderId.value).catch((error:any) => {
    errorPopup(error.message); 
  }); 
  isRegistering.value = false;
}
const registerAfternoonLeader = async () => {
  isRegistering.value = true;
  await setAfternoonLeader(game, selectedLeaderId.value).catch((error:any) => {
    errorPopup(error.message); 
  }); 
  isRegistering.value = false;
}
const unRegister = async () => {
  isUnregistering.value = true;
  let morningPromise;
  let afternoonPromise;
  try {
    if (game.value?.morningLeaders.includes(currentUser.uid)) morningPromise = removeMorningLeader(gameId.value);
    if (game.value?.afternoonLeaders.includes(currentUser.uid)) afternoonPromise = removeAfternoonLeader(gameId.value);
    await Promise.all([morningPromise, afternoonPromise]);
  } catch (error: any) {
    errorPopup(`Nous n'avons pas pu te désincrire : ${error.message}`);
  }
  isUnregistering.value = false;
};
const removeLeader = async (uid: string, schedule: string) => {
  const loading = await loadingPopup();
  try {
    if (schedule == "morning") await removeMorningLeader(gameId.value, uid);
    if (schedule == "afternoon") await removeAfternoonLeader(gameId.value, uid);
  } catch (error: any) {
    errorPopup(`Nous n'avons pas pu désinscrire l'utilisateur : ${error.message}`);
  }
  loading.dismiss();
};
const getWinner = (match: any) => {
  if (match.winner) return match.winner;
  if (match.draw === true) return "Égalité";
  return "";
};
const toggleLeadersEditMode = () => {
  editMode.value = !editMode.value;
};
const goToProfile = (uid: string) => {
  if (!editMode) router.push(`/profile/${uid}`);
};
const toggleNoScores = async () => {
  isTogglingNoScores.value = true;
  const previousValue = game.value?.noScores;
  const promises = [];
  promises.push(setGameNoScores(gameId.value, !previousValue));
  game.value?.matches.forEach(matchId => promises.push(setMatchNoScores(matchId, !previousValue)));
  await Promise.all(promises);
  isTogglingNoScores.value = false;
};
</script>
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
</style>
