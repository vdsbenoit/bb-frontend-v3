<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
  IonText,
} from '@ionic/vue'
import {
  checkmarkCircleOutline,
  checkmarkCircleSharp,
  footballOutline,
  footballSharp,
  homeOutline,
  homeSharp,
  informationCircleOutline,
  informationCircleSharp,
  optionsOutline,
  optionsSharp,
  peopleCircleOutline,
  peopleCircleSharp,
  peopleOutline,
  peopleSharp,
  personAddOutline,
  personAddSharp,
  personCircleOutline,
  personCircleSharp,
  trophyOutline,
  trophySharp,
} from 'ionicons/icons'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppConfig, useAppSettings } from './composables/app'
import { useCurrentUserProfile } from './composables/userProfile'
import { USER_ROLES } from './constants'
import { getUserName } from './utils/userProfile'

const router = useRouter()
const route = useRoute()
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const userProfile = useCurrentUserProfile()

const name = computed(() => {
  if (!userProfile.value) return 'undefined'
  return getUserName(userProfile)
})

const isSelected = (url: string) => url === route.path

const checkScoresPage = {
  title: 'Check Scores',
  url: '/check-scores',
  iosIcon: checkmarkCircleOutline,
  mdIcon: checkmarkCircleSharp,
  color: 'success',
}
const rankingPage = {
  title: 'Classement',
  url: '/ranking',
  iosIcon: trophyOutline,
  mdIcon: trophySharp,
  color: 'warning',
}
const settingsPage = {
  title: 'Paramètres',
  url: '/settings',
  iosIcon: optionsOutline,
  mdIcon: optionsSharp,
  color: 'primary',
}
const homePage = {
  title: 'Accueil',
  url: '/home',
  iosIcon: homeOutline,
  mdIcon: homeSharp,
  color: 'primary',
}
const guestHomePage = {
  title: 'Accueil',
  url: '/guest',
  iosIcon: homeOutline,
  mdIcon: homeSharp,
  color: 'primary',
}
const loginPage = {
  title: 'Connexion',
  url: '/login',
  iosIcon: personCircleOutline,
  mdIcon: personCircleSharp,
  color: 'primary',
}
const profilePage = {
  title: 'Profil',
  url: '/profile',
  iosIcon: personCircleOutline,
  mdIcon: personCircleSharp,
  color: 'primary',
}
const aboutPage = {
  title: 'A propos',
  url: '/about',
  iosIcon: informationCircleOutline,
  mdIcon: informationCircleSharp,
  color: 'medium',
}
const playerGroupsPage = {
  title: 'Joueurs',
  url: '/player-group',
  iosIcon: peopleOutline,
  mdIcon: peopleOutline,
  color: 'success',
}
const attendantGroupsPage = {
  title: 'Animateurs',
  url: '/attendant-group',
  iosIcon: peopleOutline,
  mdIcon: peopleOutline,
  color: 'danger',
}
const gamesPage = {
  title: 'Épreuves',
  url: '/games',
  iosIcon: footballOutline,
  mdIcon: footballSharp,
  color: 'ternary',
}
const applicantsPage = {
  title: 'Demandes d\'accès',
  url: '/applicants',
  iosIcon: personAddOutline,
  mdIcon: personAddSharp,
  color: 'ternary',
}
const appPages = computed(() => {
  if (!userProfile.value) return [guestHomePage, loginPage, aboutPage]
  let pages = [homePage]
  if (userProfile.value.teamId) {
    pages = [
      ...pages,
      {
        title: 'Mon Equipe',
        url: `/team/${userProfile.value.teamId}`,
        iosIcon: peopleCircleOutline,
        mdIcon: peopleCircleSharp,
        color: 'success',
      },
    ]
  }
  if (userProfile.value.role >= USER_ROLES.Animateur) {
    if (userProfile.value.games && appConfig.value) {
      for (const timeSlot of appConfig.value.attendantSchedule) {
        if (!userProfile.value.games[timeSlot.id]) continue
        pages = [
          ...pages,
          {
            title: `Mon épreuve (${timeSlot.name})`,
            url: `/game/${userProfile.value.games[timeSlot.id].id}`,
            iosIcon: footballOutline,
            mdIcon: footballSharp,
            color: 'secondary',
          },
        ]
      }
    }
    if (userProfile.value.groupId) {
      pages = [
        ...pages,
        {
          title: 'Ma section',
          url: `/attendant-group/${userProfile.value.groupId}`,
          iosIcon: peopleSharp,
          mdIcon: peopleSharp,
          color: 'secondary',
        },
      ]
    }
  }
  if (userProfile.value.role === USER_ROLES.Participant) {
    pages = [
      ...pages,
      {
        title: 'Ma section',
        url: `/player-group/${userProfile.value.groupId}`,
        iosIcon: peopleSharp,
        mdIcon: peopleSharp,
        color: 'secondary',
      },
    ]
  }
  if (userProfile.value.role >= USER_ROLES.Organisateur) pages = [...pages, checkScoresPage]
  if (userProfile.value.role > USER_ROLES.Newbie) pages = [...pages, gamesPage, playerGroupsPage]
  if (userProfile.value.role >= USER_ROLES.Animateur) pages = [...pages, attendantGroupsPage]
  if (userProfile.value.role >= USER_ROLES.Chef) pages = [...pages, applicantsPage]
  if (appSettings.value?.isRankingPublic || userProfile.value.role >= USER_ROLES.Administrateur)
    pages = [...pages, rankingPage]
  if (userProfile.value.role >= USER_ROLES.Administrateur) pages = [...pages, settingsPage]
  // bottom pages
  pages = [...pages, profilePage, aboutPage]
  return pages
})
</script>

<template>
  <IonApp>
    <IonSplitPane content-id="main-content">
      <IonMenu content-id="main-content" type="overlay" side="start" :swipe-gesture="false">
        <IonContent style="height: 100%">
          <IonList id="menu-list">
            <IonListHeader>Baden Battle</IonListHeader>
            <IonNote class="ion-text-uppercase">
              score app
            </IonNote>

            <IonMenuToggle v-for="(p, i) in appPages" :key="i" :auto-hide="false">
              <IonItem
                router-direction="root"
                :router-link="p.url"
                lines="none"
                :detail="false"
                class="hydrated"
                :class="{ selected: isSelected(p.url) }"
              >
                <IonIcon slot="start" :ios="p.iosIcon" :md="p.mdIcon" :color="p.color ?? 'medium'" />
                <IonLabel>{{ p.title }}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </IonContent>
        <IonMenuToggle :auto-hide="false">
          <IonFooter collapse="fade" class="ion-padding" @click="router.replace('/profile')">
            <div v-if="userProfile">
              <IonText>Connecté en tant que {{ name }}</IonText>
            </div>
            <div v-else>
              <IonText>Pas authentifié</IonText>
            </div>
          </IonFooter>
        </IonMenuToggle>
      </IonMenu>
      <IonRouterOutlet id="main-content" />
    </IonSplitPane>
  </IonApp>
</template>

<style>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#menu-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-item {
  cursor: pointer;
}
.no-pointer ion-item {
  cursor: auto;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
}

ion-item.selected {
  --color: var(--ion-color-primary);
}

.not-found {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.not-found strong {
  font-size: 20px;
  line-height: 26px;
}

.not-found p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
}

.not-found a {
  text-decoration: none;
  cursor: pointer;
}
ion-label p {
  color: var(--ion-color-medium) !important;
}
.time-slot {
  font-family: monospace;
  font-size: 0.9em;
}
.schedule-icon {
  font-size: 1.4em;
}
.numberCircle {
  border-radius: 50%;
  width: 60px;
  height: 60px;
  padding: 15px;
  display: inline-flex;
  flex-grow: 0;
  background: var(--ion-color-primary);
}
.numberCircle span {
  text-align: center;
  width: 35px;
  display: inline-block;
  margin: auto;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
}
.can-go-back ion-menu-button {
  display: none;
}
.md .score-choice-popup .alert-wrapper {
  max-width: 300px;
}
.md .score-choice-popup .alert-button {
  font-size: 18px;
}
ion-card-title {
  font-size: 24px;
}
ion-select {
  max-width: 100%;
}
</style>
