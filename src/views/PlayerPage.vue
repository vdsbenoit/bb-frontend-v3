<template>
  <ion-page>
    <header-template pageTitle="Joueur"></header-template>
    <ion-content :fullscreen="true">
      <div id="container">
        <strong class="capitalize">Page joueur</strong>
        
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import HeaderTemplate from '@/components/HeaderTemplate.vue'

export default {
  components: {
    IonContent,
    IonPage,
    HeaderTemplate
  }
}
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
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>