<template>
  <ion-page>
    <header-template pageTitle="Paramètres"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Utilisateurs</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-list>
            <ion-item routerLink="/users/promotions">
              <ion-label>Demandes de promotions</ion-label>
              <ion-icon slot="end" :ios="chevronForwardOutline" :md="chevronForwardSharp"></ion-icon>
            </ion-item>
            <ion-item routerLink="/users/withoutSection">
              <ion-label>Utilisateurs sans section</ion-label>
              <ion-icon slot="end" :ios="chevronForwardOutline" :md="chevronForwardSharp"></ion-icon>
            </ion-item>
            <ion-item routerLink="/users">
              <ion-label>Nouveaux utilisateurs</ion-label>
              <ion-icon slot="end" :ios="chevronForwardOutline" :md="chevronForwardSharp"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Paramètres généraux</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-list>
            <ion-item>
              <ion-input v-if="editMaxGameLeaders" v-model="editedItem.maxGameLeaders" name="maxGameLeaders" type="number" autocorrect="off"  slot="start"></ion-input>
              <ion-label v-else  @click="toggleEditMaxGameLeaders" class="ion-text-wrap fixedLabel" slot="start">Max animateurs par épreuve</ion-label>
              <ion-button v-if="editMaxGameLeaders" @click="setMaxLeaders" color="success" slot="end"><ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon></ion-button>
              <ion-input v-else @click="toggleEditMaxGameLeaders" name="maxGameLeaders" type="number" readonly="true" inputmode="none" slot="end">{{ getMaxGameLeaders() }}</ion-input>
            </ion-item>
          </ion-list>
          <ion-list>
            <ion-item>
              <ion-label>Geler les scores</ion-label>
              <ion-toggle @IonChange="freezeScores" :checked="isScoresFrozen()"></ion-toggle>
            </ion-item>
          </ion-list>
          <ion-list>
            <ion-item>
              <ion-label class="ion-text-wrap">Rendre les classements publiques</ion-label>
              <ion-toggle @IonChange="showRanking" :checked="isShowRankingToAll()"></ion-toggle>
            </ion-item>
          </ion-list>
          <ion-list>
            <ion-item>
              <ion-label>Inscriptions aux épreuves</ion-label>
              <ion-toggle @IonChange="setLeaderRegistration" :checked="isLeaderRegistrationOpen()"></ion-toggle>
            </ion-item>
          </ion-list>
          <ion-list>
            <ion-item>
              <ion-label class="ion-text-wrap">
                <h2>Autoriser l'enregistrement de scores dans n'importe quelle épreuve</h2>
                <p>Ne pas tenir compte des inscriptions aux épreuves</p>
              </ion-label>
              <ion-toggle @IonChange="setScoreAnywhere" :checked="canSetScoreAnywhere()"></ion-toggle>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonList, IonItem, IonLabel, useIonRouter, IonButton, IonToggle, IonInput } from "@ionic/vue";
import { chevronForwardOutline, chevronForwardSharp, checkmarkOutline, checkmarkSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore } from "@/services/users";
import { useRoute } from "vue-router";
import { appSettingsDefaults, getMaxGameLeaders, isScoresFrozen, isShowRankingToAll, updateAppSettings, canSetScoreAnywhere, isLeaderRegistrationOpen } from "@/services/settings";
import { reactive, ref } from "vue";

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data

const editedItem = reactive(appSettingsDefaults);
const editMaxGameLeaders = ref(false);

// lifecycle hooks

// Computed

// Watchers

// Methods

const toggleEditMaxGameLeaders = () => {
  editMaxGameLeaders.value = !editMaxGameLeaders.value;
}
const setMaxLeaders = () => {
  updateAppSettings({ maxGameLeaders: editedItem.maxGameLeaders });
  editMaxGameLeaders.value = false;
};
const freezeScores = (value: any) => {
  updateAppSettings({ freezeScore: value.detail.checked });
};
const showRanking = (value: any) => {
  updateAppSettings({ showRankingToAll: value.detail.checked });
};
const setLeaderRegistration = (value: any) => {
  updateAppSettings({ leaderRegistration: value.detail.checked });
};
const setScoreAnywhere = (value: any) => {
  updateAppSettings({ everyoneCanSetScoreAnywhere: value.detail.checked });
};
</script>
<style scoped>
 .fixedLabel {
    /* width: 100%; */
    min-width: 30% !important;
}
</style>
