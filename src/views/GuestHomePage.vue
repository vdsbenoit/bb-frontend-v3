<script setup lang="ts">
import { IonButton, IonContent, IonPage } from '@ionic/vue'
import { useRouter } from 'vue-router'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'

const router = useRouter()
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="Accueil" />
    <IonContent :fullscreen="true">
      <RefresherComponent />
      <div class="homepage-logo">
        <img src="@/assets/img/logo-bb.png" alt="Logo Baden Battle">
      </div>
      <div class="container ion-padding">
        <p>Pour accéder à l'app, il faut d'abord</p>
        <IonButton class="ion-text-lowercase" color="primary" @click="router.push('/login')">
          te connecter
        </IonButton>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.container {
  text-align: center;
}
h1 {
  color: var(--ion-color-primary);
  font-size: 40px;
}
p {
  line-height: 30px;
}
</style>
