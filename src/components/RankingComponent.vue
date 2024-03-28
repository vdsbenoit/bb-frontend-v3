<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>{{ title }}</ion-card-title>
    </ion-card-header>
    <ion-card-content v-if="!printableScores" class="ion-no-padding ion-padding-vertical">
      <ion-list v-if="rankingList && rankingList.size > 0">
        <ion-item v-for="(item, index) in rankingList.values()" :key="index" :routerLink="`${link}/${item.id}`">
          <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
          <ion-label v-if="type === 'section'">
            <b>{{ item.id }}</b> {{ item.name }} <ion-text color="medium">({{ item.city }})</ion-text>
          </ion-label>
          <ion-label v-if="type === 'team'">
            <b>{{ item.id }}</b> {{ item.sectionName }} <ion-text color="medium">({{ item.city }})</ion-text>
          </ion-label>
          <ion-badge v-if="type === 'section'" slot="end" class="ion-no-margin" color="primary">{{ item.meanScore }}</ion-badge>
          <ion-badge v-if="type === 'team'"    slot="end" class="ion-no-margin" color="primary">{{ item.score }}</ion-badge>
        </ion-item>
      </ion-list>
      <div v-else-if="isLoading" class="ion-text-center ion-align-items-center">
        <ion-spinner></ion-spinner>
      </div>
      <div v-else>
        <h2 class="ion-text-center ion-align-items-center">Pas de classement</h2>
      </div>
    </ion-card-content>
    <ion-card-content v-else>
      <div v-if="type === 'section'">
        <br><br>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Section</th>
              <th>Ville</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rankingList.values()" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.city }}</td>
              <td>{{ item.meanScore }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="type === 'team'">
        <br><br>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Équipe</th>
              <th>Section</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rankingList.values()" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.id }}</td>
              <td>{{ item.sectionName }} ({{ item.city }})</td>
              <td>{{ item.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonBadge, IonLabel, IonSpinner, IonText} from "@ionic/vue";
import { computed } from "@vue/reactivity";

import { defineProps, onMounted, ref } from "vue";
const props = defineProps(["type", "rankingList", "printableScores"]);

// reactive data
const isLoading = ref(true);

// lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

// computed data
const title = computed(() => {
  switch (props.type) {
    case "section":
      return "Sections" 
    case "team":
      return "Équipes"
    default:
      return "Iconnu"
  } 
})
const link = computed(() => {
  switch (props.type) {
    case "section":
      return "/section" 
    case "team":
      return "/team"
    default:
      return "/home"
  } 
})

</script>
