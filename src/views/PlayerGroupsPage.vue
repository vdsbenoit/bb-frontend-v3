<script setup lang="ts">
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import { arrowUpOutline, arrowUpSharp } from 'ionicons/icons'
import { computed, ref, watch, watchEffect } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import InfoCardComponent from '@/components/InfoCardComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { usePlayerGroup, usePlayerGroups } from '@/composables/playerGroup'
import { useCanSeeModerationStuff, useCanSeeRanking } from '@/composables/rights'
import { useCurrentUserProfile, useMembersOfGroup } from '@/composables/userProfile'
import { DEFAULT_GROUP_CATEGORY_ID, DEFAULT_GROUP_ID, USER_ROLES } from '@/constants'
import { updateGroupMeanScore } from '@/utils/playerGroup'
import { errorPopup, loadingPopup } from '@/utils/popup'

// reactive data

const selectedGroupCategoryId = ref(DEFAULT_GROUP_CATEGORY_ID)
const shouldLoadMembers = ref(false) // true after clicking on the show button

// Composables

const currentUserProfile = useCurrentUserProfile()
const selectedGroupId = useRouteParams<string>('groupId', DEFAULT_GROUP_ID)
const { data: selectedGroup, pending: isLoadingGroup, error: errorLoadingGroup } = usePlayerGroup(selectedGroupId)
const { data: appConfig, pending: isLoadingAppConfig, error: errorLoadingAppConfig } = useAppConfig()
const { data: groups, pending: isLoadingGroups, error: errorLoadingGroups } = usePlayerGroups(selectedGroupCategoryId)
const {
  data: groupMembers,
  pending: isLoadingMembers,
  error: errorLoadingMembers,
} = useMembersOfGroup(selectedGroupId, shouldLoadMembers)
const canSeeRanking = useCanSeeRanking()
const canSeeModerationStuff = useCanSeeModerationStuff()

// Watchers

// If the groupId is provided in the URL, this watcher sets the selectedgroupCategoryId
watchEffect(() => {
  if (
    selectedGroupId.value
    && selectedGroup.value
    && selectedGroup.value.groupCategoryId
    && selectedGroupCategoryId.value === DEFAULT_GROUP_CATEGORY_ID
  ) {
    selectedGroupCategoryId.value = selectedGroup.value.groupCategoryId
  }
})
// If selectedGroupId changes, reset the shouldLoadMembers switch
watch(selectedGroupId, () => {
  shouldLoadMembers.value = false
})

watch([errorLoadingGroup, errorLoadingGroups, errorLoadingMembers, errorLoadingAppConfig], (errors) => {
  if (errors[0]) {
    console.error('Error loading group data:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading groups:', errors[1])
  }
  if (errors[2]) {
    console.error('Error loading members:', errors[2])
  }
  if (errors[3]) {
    console.error('Error loading app config:', errors[3])
  }
})

// Computed

const canSelectTeam = computed(() => {
  if (!selectedGroupId.value) return false
  if (!currentUserProfile.value) return false
  return currentUserProfile.value.role === USER_ROLES.Participant && !currentUserProfile.value.teamId
})

// Methods

async function computeMeanScore() {
  if (!selectedGroupId.value || selectedGroupId.value === DEFAULT_GROUP_ID) {
    void errorPopup('Aucune section sélectionnée', 'Erreur lors du calcul du score moyen')
    return
  }
  const loading = await loadingPopup('Calcul du score moyen en cours...')
  try {
    await updateGroupMeanScore(selectedGroupId.value)
  } catch (error: any) {
    console.error(error)
    void errorPopup(error.message, 'Erreur lors du calcul du score moyen')
  }
  await loading.dismiss()
}
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="Sections" />
    <IonContent :fullscreen="true" class="ion-padding">
      <RefresherComponent />
      <IonCard>
        <IonCardContent class="ion-no-padding">
          <IonGrid class="">
            <IonRow>
              <IonCol size="12" size-sm="6">
                <IonSpinner v-if="isLoadingAppConfig" />
                <div v-else-if="errorLoadingAppConfig">
                  Erreur au chargement des catégories de sections
                </div>
                <IonSelect
                  v-else-if="appConfig && appConfig.groupCategories"
                  v-model="selectedGroupCategoryId"
                  interface="popover"
                  placeholder="Catégorie de section"
                >
                  <IonSelectOption
                    v-for="(groupCategory, groupCategoryId) in appConfig.groupCategories"
                    :key="groupCategoryId"
                    :value="groupCategoryId"
                  >
                    {{ groupCategory.name }}
                  </IonSelectOption>
                </IonSelect>
                <div v-else class="ion-text-center">
                  Pas de catégorie de section configurée
                </div>
              </IonCol>
              <IonCol v-if="selectedGroupCategoryId" size="12" size-sm="6">
                <IonSpinner v-if="isLoadingGroups" />
                <div v-else-if="errorLoadingGroups">
                  Erreur au chargement des sections
                </div>
                <IonSelect
                  v-else-if="groups && groups.length > 0"
                  v-model="selectedGroupId"
                  placeholder="Section"
                  interface="popover"
                >
                  <IonSelectOption v-for="group in groups" :key="group.id" color="dark" :value="group.id">
                    {{ group.id }} - {{ group.name }} ({{ group.city }})
                  </IonSelectOption>
                </IonSelect>
                <div v-else class="ion-text-center">
                  Pas de section configurée
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
      <IonGrid v-if="selectedGroupId" class="ion-no-padding">
        <IonRow>
          <IonCol size="12" size-sm="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Détails</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div v-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <IonSpinner />
                </div>
                <IonListHeader v-else-if="errorLoadingGroup" class="ion-text-center ion-align-items-center">
                  <p>Erreur lors du chargement de la section</p>
                </IonListHeader>
                <IonList v-else-if="selectedGroup">
                  <IonItem> <IonLabel>Numéro</IonLabel>{{ selectedGroup.id }} </IonItem>
                  <IonItem> <IonLabel>Nom</IonLabel>{{ selectedGroup.name }} </IonItem>
                  <IonItem> <IonLabel>Ville</IonLabel>{{ selectedGroup.city }} </IonItem>
                  <IonItem> <IonLabel>Unité</IonLabel>{{ selectedGroup.unit }} </IonItem>
                  <IonItem> <IonLabel>Nombre d'animés inscrits</IonLabel>{{ selectedGroup.nbPlayers }} </IonItem>
                  <IonItem>
                    <IonLabel>Nombre d'animateurs inscrits</IonLabel>{{ selectedGroup.nbLeaders }}
                  </IonItem>
                  <IonItem> <IonLabel>Nombre d'équipes</IonLabel>{{ selectedGroup.nbTeams }} </IonItem>
                </IonList>
                <IonListHeader v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </IonListHeader>
              </IonCardContent>
            </IonCard>
            <IonCard v-if="canSeeRanking">
              <IonCardHeader>
                <IonCardTitle> Classement </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div v-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <IonSpinner />
                </div>
                <div v-else-if="selectedGroup">
                  <IonList class="no-pointer">
                    <IonItem>
                      <IonLabel>Score accumulé</IonLabel><IonNote slot="end">
                        {{ selectedGroup.score }}
                      </IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Score moyen</IonLabel><IonNote slot="end">
                        {{ selectedGroup.meanScore }}
                      </IonNote>
                    </IonItem>
                  </IonList>
                </div>
                <IonListHeader v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </IonListHeader>
                <IonButton
                  v-if="canSeeModerationStuff"
                  expand="block"
                  color="primary"
                  class="ion-margin-horizontal ion-margin-top"
                  @click="computeMeanScore"
                >
                  Recalculer le score moyen
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="12" size-sm="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Équipes</IonCardTitle>
              </IonCardHeader>
              <InfoCardComponent v-if="canSelectTeam">
                Tu peux sélectionner une équipe ci-dessous et la marquer comme ton équipe
              </InfoCardComponent>
              <IonCardContent>
                <div v-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <IonSpinner />
                </div>
                <div v-else-if="selectedGroup">
                  <IonList v-if="selectedGroup.teams && selectedGroup.teams.length > 0">
                    <IonItem
                      v-for="teamId in selectedGroup.teams"
                      :key="teamId"
                      :router-link="`/team/${teamId}`"
                      router-direction="forward"
                      button
                    >
                      <IonLabel>{{ teamId }}</IonLabel>
                      <IonBadge
                        v-if="currentUserProfile && teamId === currentUserProfile.teamId"
                        slot="end"
                        color="primary"
                        class="ion-padding-horizontal"
                      >
                        Ton équipe
                      </IonBadge>
                    </IonItem>
                  </IonList>
                  <IonListHeader v-else>
                    <h2>Aucune équipe trouvée</h2>
                  </IonListHeader>
                </div>
                <IonListHeader v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </IonListHeader>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol v-if="canSeeModerationStuff" size="12" size-sm="6">
            <IonButton
              v-if="!shouldLoadMembers && selectedGroupId"
              expand="block"
              color="primary"
              class="ion-margin-horizontal"
              @click="shouldLoadMembers = true"
            >
              Charger les membres
            </IonButton>
            <IonCard v-if="shouldLoadMembers">
              <IonCardHeader>
                <IonCardTitle>Membres</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div v-if="isLoadingMembers" class="ion-text-center ion-align-items-center">
                  <IonSpinner />
                </div>
                <div v-else-if="errorLoadingMembers" class="ion-text-center ion-align-items-center">
                  <p>Erreur lors du chargement des membres</p>
                </div>
                <IonList v-else-if="groupMembers && groupMembers.length > 0">
                  <IonItem
                    v-for="member in groupMembers"
                    :key="member.id"
                    :router-link="`/profile/${member.id}`"
                    router-direction="forward"
                  >
                    <IonLabel>{{ member.name }}</IonLabel>
                    <IonBadge
                      v-if="member.role === USER_ROLES.Chef"
                      slot="end"
                      color="warning"
                      class="ion-padding-horizontal"
                    >
                      Chef
                    </IonBadge>
                  </IonItem>
                </IonList>
                <IonListHeader v-else>
                  <h2>Aucun membre trouvé</h2>
                </IonListHeader>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
      <div v-else class="not-found">
        <h2 v-if="!selectedGroupCategoryId" class="ion-text-center ion-align-items-center">
          Sélectionne une catégorie de section<IonIcon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
        <h2 v-else class="ion-text-center ion-align-items-center">
          Sélectionne une section <IonIcon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
ion-select {
  display: block;
  width: min(100%, 320px);
  margin-inline: auto;
  text-align: center;
  color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-dark);
  /* Set full opacity on the placeholder */
  --placeholder-opacity: 1;
}

ion-select::part(wrapper),
ion-select::part(inner),
ion-select::part(container) {
  justify-content: center;
}

ion-select::part(placeholder) {
  text-align: center;
  width: 100%;
}

ion-select::part(icon) {
  position: absolute;
  right: 0;
}
</style>
