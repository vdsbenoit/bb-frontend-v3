<template>
  <ion-page>
    <header-template pageTitle="Classement">
      <ion-button @click="setLimit"><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Lutins</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Sections</ion-card-title>
                  </ion-card-header>
                  <ion-card-content class="ion-no-padding ion-padding-vertical">
                    <div v-if="!lutinTopSections || lutinTopSections.size < 1" class="ion-text-center ion-align-items-center">
                      <ion-spinner></ion-spinner>
                    </div>
                    <ion-list v-else>
                      <ion-item v-for="(section, index) in lutinTopSections?.values()" :key="`s-lutin-${index}`" :routerLink="`/sections/${section.id}`">
                        <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
                        <ion-label>
                          {{ section.name }} <ion-text color="medium">({{ section.city }})</ion-text>
                        </ion-label>
                        <ion-badge slot="end" class="ion-no-margin" color="primary">{{ section.meanScore }}</ion-badge>
                      </ion-item>
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12" size-sm="6">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Équipes</ion-card-title>
                  </ion-card-header>
                  <ion-card-content class="ion-no-padding ion-padding-vertical">
                    <div v-if="!lutinTopTeams || lutinTopSections.size < 1" class="ion-text-center ion-align-items-center">
                      <ion-spinner></ion-spinner>
                    </div>
                    <ion-list v-else>
                      <ion-item v-for="(team, index) in lutinTopTeams?.values()" :key="`t-lutin-${index}`" :routerLink="`/team/${team.id}`">
                        <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
                        <ion-label>
                          <b>{{ team.id }}</b> {{ team.sectionName }} <ion-text color="medium">({{ team.city }})</ion-text>
                        </ion-label>
                        <ion-badge slot="end" class="ion-no-margin" color="primary">{{ team.score }}</ion-badge>
                      </ion-item>
                    </ion-list>
                  </ion-card-content>
                </ion-card>
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
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Sections</ion-card-title>
                  </ion-card-header>
                  <ion-card-content class="ion-no-padding ion-padding-vertical">
                    <div v-if="!loupTopSections || loupTopSections.size < 1" class="ion-text-center ion-align-items-center">
                      <ion-spinner></ion-spinner>
                    </div>
                    <ion-list v-else>
                      <ion-item v-for="(section, index) in loupTopSections?.values()" :key="`s-loup-${index}`" :routerLink="`/sections/${section.id}`">
                        <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
                        <ion-label>
                          {{ section.name }} <ion-text color="medium">({{ section.city }})</ion-text>
                        </ion-label>
                        <ion-badge slot="end" class="ion-no-margin" color="primary">{{ section.meanScore }}</ion-badge>
                      </ion-item>
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12" size-sm="6">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Équipes</ion-card-title>
                  </ion-card-header>
                  <ion-card-content class="ion-no-padding ion-padding-vertical">
                    <div v-if="!loupTopTeams || loupTopSections.size < 1" class="ion-text-center ion-align-items-center">
                      <ion-spinner></ion-spinner>
                    </div>
                    <ion-list v-else>
                      <ion-item v-for="(team, index) in loupTopTeams?.values()" :key="`t-loup-${index}`" :routerLink="`/team/${team.id}`">
                        <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
                        <ion-label>
                          <b>{{ team.id }}</b> {{ team.sectionName }} <ion-text color="medium">({{ team.city }})</ion-text>
                        </ion-label>
                        <ion-badge slot="end" class="ion-no-margin" color="primary">{{ team.score }}</ion-badge>
                      </ion-item>
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Lutins</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Sections</ion-card-title>
                  </ion-card-header>
                  <ion-card-content class="ion-no-padding ion-padding-vertical">
                    <div v-if="!nutonTopSections || nutonTopSections.size < 1" class="ion-text-center ion-align-items-center">
                      <ion-spinner></ion-spinner>
                    </div>
                    <ion-list v-else>
                      <ion-item v-for="(section, index) in nutonTopSections?.values()" :key="`s-nuton-${index}`" :routerLink="`/sections/${section.id}`">
                        <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
                        <ion-label>
                          {{ section.name }} <ion-text color="medium">({{ section.city }})</ion-text>
                        </ion-label>
                        <ion-badge slot="end" class="ion-no-margin" color="primary">{{ section.meanScore }}</ion-badge>
                      </ion-item>
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12" size-sm="6">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Équipes</ion-card-title>
                  </ion-card-header>
                  <ion-card-content class="ion-no-padding ion-padding-vertical">
                    <div v-if="!nutonTopTeams || nutonTopSections.size < 1" class="ion-text-center ion-align-items-center">
                      <ion-spinner></ion-spinner>
                    </div>
                    <ion-list v-else>
                      <ion-item v-for="(team, index) in nutonTopTeams?.values()" :key="`t-nuton-${index}`" :routerLink="`/team/${team.id}`">
                        <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
                        <ion-label>
                          <b>{{ team.id }}</b> {{ team.sectionName }} <ion-text color="medium">({{ team.city }})</ion-text>
                        </ion-label>
                        <ion-badge slot="end" class="ion-no-margin" color="primary">{{ team.score }}</ion-badge>
                      </ion-item>
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonText, IonBadge, 
IonSpinner, AlertInput, alertController, IonIcon } from "@ionic/vue";
import { settingsOutline, settingsSharp} from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { computed, ref } from "@vue/reactivity";
import { getTopSections } from "@/services/sections";
import { getTopTeams } from "@/services/teams";

// reactive data

const maxItems = ref(10);

// lifecicle hooks

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
