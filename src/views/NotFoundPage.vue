<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue'
import { useRouter } from 'vue-router'
import HeaderComponent from '@/components/HeaderComponent.vue'

const router = useRouter()
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="404" />
    <IonContent :fullscreen="true">
      <div class="not-found">
        <strong class="capitalize">C'est page n'existe pas ou plus</strong>
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
        <p>Retour à <a @click="router.replace('/home')">l'accueil</a></p>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped></style>
