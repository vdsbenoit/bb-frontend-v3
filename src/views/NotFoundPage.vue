<template>
  <ion-page>
    <header-template pageTitle="404"></header-template>
    <ion-content :fullscreen="true">
      <div id="container">
        <strong class="capitalize">C'est page n'existe pas ou plus</strong>
        <p>Retour à <a  @click="router.push('/')" >l'accueil</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
}

#container a {
  text-decoration: none;
  cursor: pointer;
}
</style>