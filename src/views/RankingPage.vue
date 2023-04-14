<template>
  <ion-page>
    <header-template pageTitle="Classement">
      <ion-button @click="setLimit"><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Lutins</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ranking-component type="section" :ranking-list="lutinTopSections"/>
              </ion-col>
              <ion-col size="12" size-sm="6">
                <ranking-component type="team" :ranking-list="lutinTopTeams"/>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Louveteaux</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ranking-component type="section" :ranking-list="loupTopSections"/>
              </ion-col>
              <ion-col size="12" size-sm="6">
                <ranking-component type="team" :ranking-list="loupTopTeams"/>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Baladins / Nutons</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ranking-component type="section" :ranking-list="nutonTopSections"/>
              </ion-col>
              <ion-col size="12" size-sm="6">
                <ranking-component type="team" :ranking-list="nutonTopTeams"/>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, 
AlertInput, alertController, IonIcon, IonButton } from "@ionic/vue";
import { settingsOutline, settingsSharp} from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RankingComponent from "@/components/RankingComponent.vue";
import { computed, ref } from "@vue/reactivity";
import { getTopSections } from "@/services/sections";
import { getTopTeams } from "@/services/teams";
import RefresherComponent from "@/components/RefresherComponent.vue";

// reactive data

const maxItems = ref(10);

// lifecycle hooks

// Computed

const lutinTopSections = computed(() => {
  return getTopSections("Lutins", maxItems.value);
});
const lutinTopTeams = computed(() => {
  return getTopTeams("Lutins", maxItems.value);
});
const loupTopSections = computed(() => {
  return getTopSections("Louveteaux", maxItems.value);
});
const loupTopTeams = computed(() => {
  return getTopTeams("Louveteaux", maxItems.value);
});
const nutonTopSections = computed(() => {
  return getTopSections("Baladins & Nutons", maxItems.value);
});
const nutonTopTeams = computed(() => {
  return getTopTeams("Baladins & Nutons", maxItems.value);
});

// Watchers

// Methods

const setLimit = async () => {
  const inputs = [] as AlertInput[];
  const options = [10, 25, 50, 100, 500];
  options.forEach((option: number) => {
    inputs.push({
      type: "radio",
      label: option.toString(),
      value: option,
      handler: () => {
        maxItems.value = option;
      },
      checked: option === maxItems.value,
    });
  });
  const alert = await alertController.create({
    header: "Afficher combien de scores ?",
    inputs: inputs,
    buttons: ["OK"],
  });
  await alert.present();
};
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
