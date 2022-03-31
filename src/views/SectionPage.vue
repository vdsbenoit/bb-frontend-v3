<template>
  <ion-page>
    <header-template pageTitle="Section"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">

    <ion-grid>
      <ion-row>
        <ion-col size="12" size-sm="6">
            <ion-item>
              <ion-label>Ville</ion-label>
              <ion-select interface="popover">
                <ion-select-option value="nes">NES</ion-select-option>
                <ion-select-option value="n64">Nintendo64</ion-select-option>
                <ion-select-option value="ps">PlayStation</ion-select-option>
                <ion-select-option value="genesis">Sega Genesis</ion-select-option>
                <ion-select-option value="saturn">Sega Saturn</ion-select-option>
                <ion-select-option value="snes">SNES</ion-select-option>
              </ion-select>
            </ion-item>
        </ion-col>
        <ion-col size="12" size-sm="6">
            <ion-item>
              <ion-label>Section</ion-label>
              <ion-select interface="popover">
                <ion-select-option value="nes">NES</ion-select-option>
                <ion-select-option value="n64">Nintendo64</ion-select-option>
                <ion-select-option value="ps">PlayStation</ion-select-option>
                <ion-select-option value="genesis">Sega Genesis</ion-select-option>
                <ion-select-option value="saturn">Sega Saturn</ion-select-option>
                <ion-select-option value="snes">SNES</ion-select-option>
              </ion-select>
            </ion-item>
        </ion-col>
      </ion-row>
    </ion-grid>

      <ion-card>
        <ion-card-header>
          <ion-card-title>{{sectionName}} </ion-card-title>
          <ion-card-subtitle> {{sectionCity}} </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content :class="showRanking">
          <ion-list>
            <ion-item>
              <ion-label>Moyenne section</ion-label><ion-note slot="end">7</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Classement section</ion-label><ion-note slot="end">3</ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Équipes</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list  v-if="teams.length > 0">
            <ion-item v-for="team in teams" :key="team.id" routerLink="/team/{{team.id}}" class="ion-no-padding"> 
              <span>{{team.id}}</span>
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
IonGrid, IonRow, IonCol, IonListHeader, IonIcon, IonSelect, IonSelectOption
} from "@ionic/vue";
import { closeOutline, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline} from 'ionicons/icons';
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services";
import { computed } from "@vue/reactivity";

const store = useAuthStore();
const showRanking = computed(() => {
  return store.profile.role >= ROLES.Moderateur ? "" : "ion-hide"
});

const sectionName = "Louveteaux Férao";
const sectionCity = "Soignies";
const teams: any = [
  {id: "A1"},
  {id: "A2"},
];

</script>
<style scoped>
.numberCircle {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    padding: 15px;
    display: inline-flex;
    flex-grow: 0;
    background: var(--ion-color-primary);
}
.numberCircle span {
    text-align: center;
    width: 25px;
    display: inline-block;
    margin: auto;
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
}
</style>