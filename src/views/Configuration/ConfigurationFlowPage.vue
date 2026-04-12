<script setup lang="ts">
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonPage } from '@ionic/vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="Configuration" />
    <IonContent :fullscreen="true">
      <RefresherComponent />
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Configuration initiale</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          Flux de configuration en cours de construction.
          Tu peux utiliser cette page comme point d'entrée après la réinitialisation.
        </IonCardContent>
      </IonCard>
    </IonContent>
  </IonPage>
</template>
