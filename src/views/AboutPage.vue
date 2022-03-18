<template>
  <ion-page>
    <header-template pageTitle="A propos"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="logo">
        <img src="@/assets/img/Logo-bb.png" alt="Logo Baden Battle" />
      </div>
      <div class="about-info">
        <ion-list lines="none">
          <ion-item>
            <ion-icon :icon="calendar" slot="start"></ion-icon>
            <ion-label>23 Avril 2022</ion-label>
          </ion-item>

          <ion-item>
            <ion-icon :icon="pin" slot="start"></ion-icon>
            <ion-label style="white-space: pre-wrap">
              Collège St Vincent<br/>
              Chaussée de Braine, 22<br/>
              7060 Soignies
            </ion-label>
          </ion-item>

          <ion-grid>
            <ion-row>
              <ion-item>
                <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
                <ion-label>A propos</ion-label>
              </ion-item>
            </ion-row>
            <ion-row>
              <p class="ion-padding-start ion-padding-end">
                Il sʼagit dʼun grand rassemblement scout, guide et patro à destination des étincelles, lutins, louvettes, louveteaux et chevaliers
                (donc de 8 à 12 ans, filles et garçons) mais également depuis cette année à destination des plus jeunes âgés de 5 à 7 ans (baladins et
                nutons), organisé par le poste pionnier Peter Pan de Soignies. Durant toute la journée, les participants passent à travers de
                nombreuses activités opposant les sections entre elles sous forme de petites équipes. Le but ultime étant, évidemment, de gagner des
                défis ainsi que de nombreux prix. Les animations sont variées afin que tout le monde s'y retrouve: certaines sont physiques, d'autres
                intellectuelles ou même culturelles. La coopération sera de mise pour atteindre le podium! <br /><br />

                Pour toute information complémentaire, n'hésitez pas à nous joindre sur notre
                <a href="https://www.facebook.com/badenbattle/">page Facebook</a> ou via notre
                <a href="mailto:infobadenbattle@gmail.com">adresse email</a>.
              </p>
            </ion-row>
          </ion-grid>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { calendar, pin, informationCircleOutline } from 'ionicons/icons';
import { IonContent, IonPage, IonIcon, IonLabel, IonRow, IonList, IonItem, IonGrid } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";

</script>

<style scoped>
.logo {
  background-color: var(--ion-background-color);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: min(1%, 20px);
  width: 100%;
  height: 30%;
  margin-bottom: 20px;
}

.logo img {
  max-width: 100%;
  max-height: 100%;
}

.about-info p {
  color: var(--ion-color-dark);
  text-align: justify;
}

.about-info ion-icon {
  margin-left: 15px;
  margin-inline-end: 20px;
}

.ios .about-info {
  text-align: center;
}

</style>