import { Timestamp } from 'firebase/firestore'
import { fbSendSignInEmail, fbSignInWithEmailLink } from '@/services/firebase'
import { choicePopup, loadingPopup } from '@/utils/popup'
import { createUserProfile, getUserProfile, updateUserProfile } from './userProfile'

export async function sendSignInEmail(email: string, redirectUrl: string) {
  email = email.trim()
  try {
    await fbSendSignInEmail(email, redirectUrl)
    window.localStorage.setItem('emailForSignIn', email)
  } catch (e: any) {
    console.error(e)
    throw e
  }
}

export async function processSignInLink(href: string) {
  let email = window.localStorage.getItem('emailForSignIn')
  let displayEmailError = true
  if (!email) {
    const choiceHandler = (choice: string) => {
      switch (choice) {
        case 'Ok, j\'essaie ça':
          displayEmailError = false
          break
        case 'J\'essaie de me connecter ici':
          // eslint-disable-next-line no-alert
          email = window.prompt('Quel email as-tu utilisé pour te connecter ?') ?? ''
          email = email.trim()
          break
      }
    }
    const message = `On dirait que tu n'as pas ouvert le lien depuis le même navigateur que là où tu as essayé de te connecter.<br/><br/>
    Il devrait y avoir une bouton dans pour ouvrir le lien dans ton navigateur habituel plutôt que ton app d'email. <br/><br/>
    Si pas, appuye longuement sur le lien de connexion fourni dans le mail, copie l'adresse du lien, puis de clique 
    sur "J'ai copié le lien de l'email" dans l'app.`
    await choicePopup('', ['J\'essaie de me connecter ici', 'Ok, j\'essaie ça'], choiceHandler, 'choice-popup', message)
  }
  if (!email) {
    if (displayEmailError) throw new Error('Impossible de récupérer l\'email d\'authentification')
    return
  }
  const loading = await loadingPopup()
  try {
    const response = await fbSignInWithEmailLink(email, href)
    if (response.user) {
      const userProfile = await getUserProfile(response.user.uid as string)
      if (userProfile === undefined) {
        await createUserProfile(response.user.uid as string, response.user.email as string)
      } else {
        await updateUserProfile(response.user.uid as string, { lastLogin: Timestamp.now() })
      }
      window.localStorage.removeItem('emailForSignIn')
      await loading.dismiss()
      return true
    } else {
      await loading.dismiss()
      return false
    }
  } catch (e: any) {
    await loading.dismiss()
    if (e.code === 'auth/invalid-action-code') {
      throw new Error(`Le lien que tu viens d'utiliser n'est plus valide. <br/><br/>
        Clique sur le lien du dernier email que tu as reçu ou réessaie la procédure d'inscription depuis le début.`)
    } else {
      console.error(e)
      throw new Error('Une erreur est survenue durant la connexion')
    }
  }
}
