<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button v-if="canEditLeaders" @click="toggleLeadersEditMode"><ion-icon slot="icon-only" :ios="editIcon.ios" :md="editIcon.md"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="isGame || pending">
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
                    <ion-select-option v-for="section in leaderSections?.values()" :value="section.id" :key="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
                  </ion-select>
                </ion-col>
                <ion-col size="12" size-sm="6" v-if="selectedLeaderSection">
                    <ion-spinner v-if="isLoadingLeaders"></ion-spinner>
                    <ion-select v-else v-model="selectedLeaderId" placeholder="Choisir animateur" interface="popover">
                      <ion-select-option color="dark" v-for="leader in sectionLeaders?.values()" :value="leader.uid" :key="leader.uid"> {{ user.getName(leader.uid) }} </ion-select-option>
                    </ion-select>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="selectedLeaderId">
                  <ion-button @click="registerMorningLeader" expand="block" color="primary" :disabled="isRegistering">
                    <ion-spinner v-if="isRegistering"></ion-spinner>
                    <span v-else>Ajouter {{ user.getName(selectedLeaderId) }} au matin </span>
                  </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="selectedLeaderId">
                  <ion-button @click="registerAfternoonLeader" expand="block" color="primary" :disabled="isRegistering">                   
                    <ion-spinner v-if="isRegistering"></ion-spinner>
                    <span v-else>Ajouter {{ user.getName(selectedLeaderId) }} l'après-midi </span>
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
              <div v-if="pending" class="ion-text-center">
                <ion-spinner></ion-spinner>
              </div>
              <ion-list-header v-else><h2>Aucun duel trouvé</h2></ion-list-header>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-else class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette épreuve...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonRow, IonCol, IonListHeader, IonBadge, 
IonGrid, IonText, IonButton, useIonRouter, IonSpinner, IonIcon, IonSelect, IonSelectOption } from "@ionic/vue";
import { closeOutline, closeSharp, pencilOutline, pencilSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services/users";
import { errorPopup, loadingPopup } from "@/services/popup";
import { computed, reactive, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { streamGameMatches, setMatchNoScores } from "@/services/matches";
import { onBeforeMount, watchEffect } from "vue";
import { getSchedule, isLeaderRegistrationOpen } from "@/services/settings";
import { streamLeaderSection, getLeaderSections } from "@/services/leaderSections";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { removeAfternoonLeader, removeMorningLeader, setAfternoonLeader, setGameNoScores, setMorningLeader, useGame } from "@/composables/games";

// reactive data

const editMode = ref(false);
const gameId = ref(0);
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

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();
const { data: game, pending } = useGame(gameId);

// lifecycle hooks

onBeforeMount(() => {
  if (route.params.gameId) gameId.value = +route.params.gameId;
  if (!gameId.value) console.error("Game ID not set in the URL");
});


// Computed

const isGame = computed(() => game.value && game.value.id)
const canRegister = computed(() => {
  return isLeaderRegistrationOpen() && (user.profile.role == ROLES.Animateur || user.profile.role == ROLES.Chef);
});
const matches = computed(() => {
  return streamGameMatches(gameId.value);
});
const leaderSections = computed(() => {
  if (!editMode.value) return new Map(); // don't load sections if not in edit mode
  if (user.profile.role === ROLES.Chef ) {
    const sections = new Map();
    sections.set(user.profile.sectionId, streamLeaderSection(user.profile.sectionId));
    return sections;
  }
  if (user.profile.role > ROLES.Chef) return getLeaderSections()
});
const sectionLeaders = computed(() => {
  return selectedLeaderSection.value ? user.getSectionMembers(selectedLeaderSection.value) : undefined;
});
const isLoadingLeaders = computed(() => {
  if (selectedLeaderSection.value && !sectionLeaders.value) return true;
  return false;
});
const pageTitle = computed(() => {
  if (isGame.value) return `Épreuve ${gameId.value}`;
  if (pending.value) return "Chargement";
  return "Épreuve inconnue";
});
const canEditLeaders = computed(() => {
  return user.profile.role >= ROLES.Chef;
});
const canEditGameSettings = computed(() => {
  return user.profile.role >= ROLES.Administrateur;
});
const editIcon = computed(() => {
  return editMode.value ? { ios: closeOutline, md: closeSharp } : { ios: pencilOutline, md: pencilSharp };
});
const isMorningLeader = computed(() => {
  return game.value?.morningLeaders.includes(user.profile.uid) ?? false
});
const isAfternoonLeader = computed(() => {
  return game.value?.afternoonLeaders.includes(user.profile.uid) ?? false
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
      await user.asyncFetchProfile(leaderId);
      const section = user.getProfile(leaderId).sectionName;
      const name = user.getName(leaderId);
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
    if (game.value?.morningLeaders.includes(user.uid)) morningPromise = removeMorningLeader(gameId.value);
    if (game.value?.afternoonLeaders.includes(user.uid)) afternoonPromise = removeAfternoonLeader(gameId.value);
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
