<template>
  <ion-page>
    <header-template pageTitle="Sections"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
<ion-card>
  <ion-card-content class="ion-no-padding">
    <ion-grid>
      <ion-row>
        <ion-col size="12" size-sm="6">
            <ion-item>
              <ion-label>Ville</ion-label>
              <ion-select v-model="selectedCity" interface="popover">
                <!-- <ion-select-option value="all">Tout</ion-select-option> -->
                <ion-select-option v-for="city in getCities()" :value="city" :key="city">{{city}}</ion-select-option>
              </ion-select>
            </ion-item>
        </ion-col>
        <ion-col size="12" size-sm="6">
            <ion-item>
              <ion-label>Section</ion-label>
              <ion-select v-model="selectedSection">
                <ion-select-option v-for="sectionName in getSectionNames" :value="sectionName" :key="sectionName">{{sectionName}}</ion-select-option>
              </ion-select>
            </ion-item>
        </ion-col>
      </ion-row>
    </ion-grid>
    </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{selectedSection}} </ion-card-title>
          <ion-card-subtitle> {{selectedCity}} </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content :class="showRanking">
          <ion-list>
            <ion-item>
              <ion-label>Score moyen</ion-label><ion-note slot="end">7</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Classement</ion-label><ion-note slot="end">3</ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Équipes</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list  v-if="getSectionTeams.length > 0">
            <ion-item v-for="team in getSectionTeams" :key="team" :routerLink="'/teams/' + team"> 
              <ion-label>{{team}}</ion-label>
              <ion-badge slot="end" color="primary" :class="team === store.profile.team ? '' : 'ion-hide'">Ton équipe</ion-badge>
            </ion-item>
          </ion-list>
          <ion-list-header v-else>
            Aucune équipe trouvée
          </ion-list-header>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, 
IonGrid, IonRow, IonCol, IonListHeader, IonIcon, IonSelect, IonSelectOption, IonBadge
} from "@ionic/vue";
import { closeOutline, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline} from 'ionicons/icons';
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services";
import { computed, ref } from "@vue/reactivity";

const store = useAuthStore();
const showRanking = computed(() => {
  return store.profile.role >= ROLES.Moderateur ? "" : "ion-hide"
});
let selectedCity = ref("all");
let selectedSection = ref("");
// Temp mode
const sections : { [key: string]: any } = {
  "Soignies": {
    "Louveteaux Férao": [
      "A1", "A2", "A3",
    ],
    "Louveteaux Waigs": [
      "B1", "B2", "B3",
    ],
  },
  "Ecaussinnes": {
    "Louveteaux": [
    ],
    "Lutins": [
      "D1", "D2", "D3",
    ],
  },
  "Braine": {
    "Louveteaux": [
      "E1", "E2", "E3",
    ],
    "Lutins": [
      "F1", "F2", "F3",
    ],
  },
}

const getCities = (): string[] => {
  return ["Soignies", "Ecaussinnes", "Braine"];
};
const getSectionNames = computed(() => {
  if (!sections) return [];
  const allCities = Object.values(sections);
  const citiesNames = Object.keys(allCities);
  if (selectedCity.value === "all") return citiesNames;
  return Object.keys(sections[selectedCity.value]);
});
const getSectionTeams = computed(() => {
  if (!selectedSection.value) return [];
  return sections[selectedCity.value][selectedSection.value];
}); 



</script>
<style scoped>
.your-team-note {
  background-color: var(--ion-color-primary);
}
ion-select{
  max-width: 100%;
}
</style>