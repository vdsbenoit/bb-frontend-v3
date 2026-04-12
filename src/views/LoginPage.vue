<script setup lang="ts">
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  useIonRouter,
} from '@ionic/vue'
import { useRouteQuery } from '@vueuse/router'
import { computed, onMounted, ref } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useCurrentUserProfile } from '@/composables/userProfile'
import { USER_ROLES } from '@/constants'
import { processSignInLink, sendSignInEmail } from '@/utils/auth'
import { errorPopup, infoPopup, toastPopup } from '@/utils/popup'

const router = useIonRouter()
const userProfile = useCurrentUserProfile()
const mode = useRouteQuery<string>('mode', 'newLogin')
const redirect = useRouteQuery<string>('redirect', `/home`)

// reactive data

const email = ref('')
const isSendingEmail = ref(false)
const isEmailSent = ref(false)
const dgprChecked = ref(false)
const isValidating = ref(false)

// Watcher
onMounted(() => {
  if (mode.value && mode.value === 'signIn') {
    void signIn(window.location.href)
  }
})

// computed data

const sendButtonText = computed(() => {
  return isEmailSent.value ? 'Renvoyer un mail' : 'Connexion'
})
const sendButtonColor = computed(() => {
  return isEmailSent.value ? 'medium' : 'primary'
})

// methods

async function sendEmail() {
  if (!dgprChecked.value) {
    dgprChecked.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  if (!email.value) return
  isSendingEmail.value = true
  try {
    await sendSignInEmail(email.value, `https://${location.host}${redirect.value}`)
    isEmailSent.value = true
    void toastPopup('On t\'a envoyé un email\nClique sur le lien qui s\'y trouve pour te connecter', 20000)
  } catch (error: any) {
    void errorPopup(error.message, `Impossible de se connecter`)
  }
  isSendingEmail.value = false
}

async function signIn(href: string) {
  try {
    await processSignInLink(href)
    if (!userProfile.value || (userProfile.value.role === USER_ROLES.Newbie && !userProfile.value.hasDoneOnboarding)) {
      router.replace('/onboarding')
    } else {
      router.replace('/home')
    }
  } catch (error: any) {
    void errorPopup(error.message)
  }
}

function sanitizeClipboardContent(input: string): string | null {
  try {
    const url = new URL(input)

    // Check for valid HTTPS protocol
    if (url.protocol !== 'https:') {
      return null
    }

    // Example: Allow Firebase Dynamic Links or direct Firebase sign-in links
    const allowedDomains = ['app.badenbattle.be', window.location.hostname]

    if (allowedDomains.some(domain => url.hostname.endsWith(domain))) {
      return url.href // Return sanitized link
    }
  } catch {
    console.error('Clipboard content is not a valid or supported Firebase sign-in link.')
  }
  return null
}

/**
 * Reads the clipboard content and attempts to sign in with the extracted Firebase sign-in link.
 */
async function signInWithClipboard() {
  // Ensure the Clipboard API is supported
  if (!navigator.clipboard) {
    void errorPopup('Cette fonctionnalité n\'est pas supportée')
    return
  }

  // Read the content of the clipboard
  try {
    const clipboardText = await navigator.clipboard.readText()
    const sanitizedLink = sanitizeClipboardContent(clipboardText)
    if (!sanitizedLink) {
      console.error('Invalid link from clipboard : ', sanitizedLink)
      void errorPopup('Copie le lien qui t\'as été envoyé par email', 'Le lien dans le presse-papier n\'est pas valide')
      return
    }
    await signIn(sanitizedLink)
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      void errorPopup('Tu dois authoriser l\'accès au presse-papier', 'Impossible de lire le presse-papier')
      // request permission again
    } else {
      void errorPopup('Assure-toi que le lien a bien été copié', 'Impossible de lire le presse-papier')
    }
  }
}

function showPrivacyNotice() {
  const privacyNotice = [
    `Pour le bon fonctionnement de l'application, des données liées à l'utilisateur sont enregistrées telles que son nom, le nom de sa section, la ville de sa section et son adresse email.`,
    `Ces données sont partagées à l'application par l'utilisateur de manière volontaire. A tout moment, l'utilisateur peut supprimer son profil ainsi que toutes les données qui y sont liées. Les données des utilisateurs sont effacées chaque année.`,
    `Les utilisateurs ne peuvent voir que le nom et la section des autres utilisateurs. Seuls les organisateurs & administrateurs de l'application peuvent voir les profils des autres utilisateurs.`,
    `La base de donnée est localisée en Europe, sur le serveur europe-west3 appartenant à Google et situé à Francfort. Cette application a été développée dans un but non-commercial. Aucune donnée n'est revendue à des tiers.`,
    `Cette application est la propriété de Benoit Vander Stappen. Pour toute question relative à ces conditions, veuillez le contacter sur vdsbenoit@gmail.com.`,
  ].join('\n\n')
  void infoPopup(privacyNotice, 'Vie privée & utilisation des données')
}
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="Connexion" />
    <IonContent :fullscreen="true" class="ion-padding">
      <RefresherComponent />
      <div class="homepage-logo">
        <img src="@/assets/img/logo-bb.png" alt="Logo Baden Battle">
      </div>
      <IonText v-if="redirect" class="ion-text-center">
        <p>Connecte-toi pour accéder à ce contenu</p>
      </IonText>
      <form @submit.prevent="sendEmail">
        <IonList id="login-form">
          <IonItem lines="full">
            <IonInput
              v-model="email"
              name="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              required
              autocapitalize="off"
              :clear-input="true"
              label="Entre ton email ici"
              label-placement="floating"
              helper-text="Utilise une addresse a laquelle tu as acces depuis ton telephone"
            />
          </IonItem>
          <IonItem lines="none">
            <IonCheckbox slot="start" v-model="dgprChecked" class="ion-no-margin ion-margin-end" />
            <IonLabel class=""> J'accepte les <a @click="showPrivacyNotice">conditions d'utilisation</a> </IonLabel>
          </IonItem>
          <IonButton expand="block" :color="sendButtonColor" @click="sendEmail">
            <IonSpinner v-if="isSendingEmail" />
            <span v-else>{{ sendButtonText }}</span>
          </IonButton>
          <IonButton expand="block" color="tertiary" @click="signInWithClipboard">
            <IonSpinner v-if="isValidating" />
            <span v-else>J'ai copié le lien de l'email</span>
          </IonButton>
        </IonList>
      </form>
    </IonContent>
  </IonPage>
</template>

<style scoped>
ion-button {
  margin: 15px;
}
#login-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
