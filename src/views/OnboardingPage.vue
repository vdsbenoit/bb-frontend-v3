<script setup lang="ts">
import type { UserProfile } from '@/types'
import type { Group } from '@/types/Group'
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/vue'
import DOMPurify from 'dompurify'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { useAttendantGroups } from '@/composables/attendantGroup'
import { usePlayerGroups } from '@/composables/playerGroup'
import { useCurrentUserProfile } from '@/composables/userProfile'
import { DEFAULT_GROUP_CATEGORY_ID, DEFAULT_GROUP_ID, DEFAULT_USER_ROLE_VALUE, USER_ROLES } from '@/constants'
import { getGroup } from '@/utils/playerGroup'
import { confirmPopup, errorPopup, toastPopup } from '@/utils/popup'
import { updateUserProfile } from '@/utils/userProfile'

const router = useRouter()

// Strip Erreur, Anonyme & Newbie from ROLES
const selectableRoles = Object.fromEntries(
  Object.entries(USER_ROLES).filter(
    ([, value]) => ![USER_ROLES.Erreur, USER_ROLES.Anonyme, USER_ROLES.Newbie].includes(value),
  ),
)

// reactive data

const name = ref('')
const selectedRole = ref(DEFAULT_USER_ROLE_VALUE)
const selectedgroupCategoryId = ref(DEFAULT_GROUP_CATEGORY_ID)
const selectedGroupId = ref(DEFAULT_GROUP_ID)
const nameError = ref(false)
const isUpdatingProfile = ref(false)

// composables & computed data

const currentUser = useCurrentUserProfile()
const appConfig = useAppConfig()
const {
  data: playerGroups,
  pending: isLoadingPlayerGroups,
  error: errorLoadingGroups,
} = usePlayerGroups(selectedgroupCategoryId)

const isParticipant = computed(() => selectedRole.value === USER_ROLES.Participant)
const isAttendant = computed(() => selectedRole.value >= USER_ROLES.Animateur)
const loadStaffGroups = computed(() => (selectedRole.value >= USER_ROLES.Organisateur ? 'only' : 'exclude'))
const {
  data: attendantGroups,
  pending: isLoadingAttendantGroups,
  error: errorLoadingAttendantGroups,
} = useAttendantGroups(isAttendant, loadStaffGroups, true, currentUser)

watch([errorLoadingGroups, errorLoadingAttendantGroups], (errors) => {
  if (errors[0]) {
    console.error('Error loading player groups:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading attendant groups:', errors[1])
  }
})

const canSubmit = computed(() => {
  if (!name.value) return false
  if (
    isParticipant.value
    && selectedgroupCategoryId.value !== DEFAULT_GROUP_CATEGORY_ID
    && selectedGroupId.value !== DEFAULT_GROUP_ID
  ) {
    return true
  }
  if (isAttendant.value && selectedGroupId.value !== DEFAULT_GROUP_ID) return true
  if (selectedRole.value >= USER_ROLES.Organisateur) return true
  return false
})

// methods

function handleRoleChange() {
  // Reset category, player group and attendant group values when changing the role
  selectedgroupCategoryId.value = DEFAULT_GROUP_CATEGORY_ID
  selectedGroupId.value = DEFAULT_GROUP_ID
  if (!name.value) nameError.value = true
}
function handleNameChange() {
  nameError.value = !name.value
}

function processForm(groupData: Group) {
  isUpdatingProfile.value = true
  let newProfile: Partial<UserProfile>
  if (selectedRole.value === USER_ROLES.Participant) {
    newProfile = {
      name: DOMPurify.sanitize(name.value),
      role: selectedRole.value,
      groupId: selectedGroupId.value,
      groupName: groupData.name,
      hasDoneOnboarding: true,
    }
  } else {
    newProfile = {
      name: DOMPurify.sanitize(name.value),
      requestedRole: selectedRole.value,
      requestedGroupId: selectedGroupId.value,
      requestedGroupName: groupData.name,
      hasDoneOnboarding: true,
    }
  }
  if (!currentUser.value) return errorPopup('currentUser not found', 'Impossible de mettre à jour le profil')
  updateUserProfile(currentUser.value.id, newProfile)
    .then(() => {
      void toastPopup('Ton profil a été mis à jour')
      isUpdatingProfile.value = false
    })
    .catch((error: any) => {
      void errorPopup(error.message, `Le profile n'a pas pu être mis à jour`)
      isUpdatingProfile.value = false
    })
    .finally(() => {
      void router.replace({ name: 'home' })
    })
  console.log('Profile udpated', newProfile)
}

async function submitForm() {
  let message = ''
  let groupData: Group

  // Check if all required fields are filled
  if (!name.value) return errorPopup('Mentionne ton totem ou ton nom')
  if (selectedRole.value < USER_ROLES.Participant) return errorPopup('Choisis un role')
  if (!selectedGroupId.value) return errorPopup('Choisis une section')

  try {
    groupData = await getGroup(selectedGroupId.value)
  } catch (error: any) {
    return errorPopup(error.message, `Une erreur est survenue`)
  }
  switch (selectedRole.value) {
    case USER_ROLES.Participant:
      message = `Tu as choisi le role de participant.\n\nCela signifie que tu participeras à la Baden Battle avec la section ${groupData.name}.`
      break
    case USER_ROLES.Animateur:
      message = `Tu as choisi le role d'animateur.\n\nCela signifie qu'un•e des chefs de la section ${groupData.name} ou un•e organisateur/organisatrice de la Baden Battle devra valider ta demande avant que tu ne puisses utiliser l'app.`
      break
    case USER_ROLES.Chef:
      message = `Tu as choisi le role de chef.\n\nCela signifie qu'un•e des chefs de la section ${groupData.name} ou un•e organisateur/organisatrice de la Baden Battle devra valider ta demande avant que tu ne puisses utiliser l'app.`
      break
    case USER_ROLES.Organisateur:
      message = `Tu as choisi le role d'organisateur de la Baden Battle.\n\nCela signifie qu'une autre personne avec le rôle d'organisateur de la Baden Battle devra valider ta demande avant que tu ne puisses utiliser l'app.`
      break
    case USER_ROLES.Administrateur:
      message = `Tu as choisi le role d'administrateur de l'application.\n\nCela signifie qu'une autre personne avec le rôle d'administrateur devra valider ta demande avant que tu ne puisses utiliser l'app.`
      break
  }
  const handler = () => processForm(groupData)
  return confirmPopup(message, handler, null, 'Continuer ?')
}
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="Onboarding" />
    <IonContent :fullscreen="true" class="ion-padding">
      <RefresherComponent />
      <IonCard>
        <IonCardHeader v-if="currentUser && currentUser.rejectionReason">
          <IonCardTitle>Outch !</IonCardTitle>
          <p style="color: var(--ion-color-dark)">
            Ta demande d'accès a été refusée.
            <br><br>
            {{ currentUser.rejectionReason }}
            <br><br>
            Tu peux réessayer ci-dessous.
          </p>
        </IonCardHeader>
        <IonCardHeader v-else>
          <IonCardTitle>Bienvenue !</IonCardTitle>
          <p>Avant d'aller plus loin, faisons connaissance.</p>
        </IonCardHeader>
        <form @submit.prevent="submitForm" @keydown.enter="submitForm">
          <IonList class="ion-no-padding">
            <IonItem>
              <IonInput
                v-model="name"
                name="name"
                type="text"
                autocorrect="off"
                required
                label="Totem / Nom"
                label-placement="floating"
                :class="{ 'ion-invalid ion-touched': nameError }"
                :error-text="nameError ? 'Mentionne ton totem ou ton nom' : undefined"
                @ion-change="handleNameChange"
              />
            </IonItem>
            <IonItem>
              <IonSelect
                v-model="selectedRole"
                required
                interface="popover"
                label="Quel sera ton role durant la Baden Battle ?"
                label-placement="floating"
                @ion-change="handleRoleChange"
              >
                <IonSelectOption v-for="(value, roleName) in selectableRoles" :key="value" :value="value">
                  {{ roleName }}
                </IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem v-if="isParticipant">
              <IonSelect
                v-model="selectedgroupCategoryId"
                interface="popover"
                required
                label="Type de section"
                label-placement="floating"
              >
                <IonSelectOption v-for="(groupCategory, id) in appConfig?.groupCategories" :key="id" :value="id">
                  {{ groupCategory.name }}
                </IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem v-if="isParticipant && selectedgroupCategoryId">
              <IonSpinner v-if="isLoadingPlayerGroups" />
              <div v-else-if="errorLoadingGroups">
                Erreur
              </div>
              <IonSelect
                v-else
                v-model="selectedGroupId"
                interface="popover"
                required
                label="Section"
                label-placement="floating"
              >
                <IonSelectOption v-for="playerGroup in playerGroups" :key="playerGroup.id" :value="playerGroup.id">
                  {{ playerGroup.name }} ({{ playerGroup.city }})
                </IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem v-if="isAttendant">
              <IonSpinner v-if="isLoadingAttendantGroups" />
              <div v-else-if="errorLoadingAttendantGroups">
                Erreur
              </div>
              <IonSelect
                v-else
                v-model="selectedGroupId"
                interface="popover"
                required
                label="Section"
                label-placement="floating"
              >
                <IonSelectOption
                  v-for="attendantgroup in attendantGroups"
                  :key="attendantgroup.id"
                  :value="attendantgroup.id"
                >
                  {{ attendantgroup.name }} ({{ attendantgroup.city }})
                </IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
          <IonButton type="submit" expand="block" class="ion-margin" :disabled="!canSubmit">
            Continuer
          </IonButton>
        </form>
      </IonCard>
    </IonContent>
  </IonPage>
</template>

<style scoped></style>
