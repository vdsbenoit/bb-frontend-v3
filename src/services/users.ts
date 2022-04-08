import { User as fbUser } from "firebase/auth";
import { defineStore } from "pinia";
import {
  fbAuthStateListener,
  fbSendSignInEmail,
  fbSignInWithEmailLink,
  fbSignOut,
} from "./firebase";
import { magnetar } from "./magnetar";

const USER_PROFILES_COLLECTION = "users";

///////////////////////
/// Interfaces & co //
/////////////////////

export const ROLES = {
  Anonyme:        0,
  Participant:    2,
  Animateur:      4,
  Moderateur:     8,
  Administrateur: 10,
}

export const getRoleByValue = (role: number): string => {
  for (const [key, value] of Object.entries(ROLES)) {
    if (value === role)
      return key;
  }
  throw new Error(`Role inconnu: ${role}`);
}

interface UserSettings {
  autoRefreshRaking: boolean;
  ready: boolean;
}

interface Profile {
  email: string;
  totem: string;
  firstName: string;
  lastName: string;
  role: number;
  settings: UserSettings;
  team: string;
  morningGame: string;
  afternoonGame: string;
  section: string;
}

///////////////////////
/// Magnetar config //
/////////////////////

function usersDefaults(payload?: any) {
  const defaults = { 
    email: "",
    totem: "",
    firstName: "",
    lastName: "",
    role: 0,
    settings: {},
    team: "",
    morningGame: "",
    afternoonGame: "",
    section: "",
  }
  return { ...defaults, ...payload }
}

export const usersModule = magnetar.collection(USER_PROFILES_COLLECTION, {
  modifyPayloadOn: { insert: usersDefaults },
  modifyReadResponseOn: { added: usersDefaults },
});

//////////////////
// Pinia store //
////////////////

interface authStoreState {
  user: fbUser | null;
  profile: Profile;
  error: any;
}

export const useAuthStore = defineStore("authStore", {
  state: (): authStoreState => ({
    user: null,
    profile: usersDefaults({}),
    error: null,
  }),
  getters: {
    isLoggedIn: (state) => state.user !== null,
    userError: (state) => state.error,
    uid: (state): string => state.user ? state.user.uid : "undefined",
  },
  actions: {
    /**
     * listens for state changes, ie a user logging in or out
     * and if logging in, loading the associated profile info
     * @returns
     */
    initializeAuthListener() {
      return new Promise((resolve) => {
        fbAuthStateListener(async (user: any) => {
          this.user = user ? user : null;
          if (user) {
            this.streamUserProfile(user.uid as string);
          }
          this.profile = usersDefaults({});
          resolve(true);
        });
      });
    },
    async sendSignInEmail(email: string) {
      try {
        await fbSendSignInEmail(email);
        window.localStorage.setItem('emailForSignIn', email);
      } catch (e: any) {
        this.user = null;
        this.error = e;
        console.error(e);
      }
    },
    async processSignInLink(href: string) {
      let email = window.localStorage.getItem('emailForSignIn');
      //fixme: replace this with an error, it should not happen
      if (!email) {
        email = window.prompt('Quel email as-tu utilisé pour te connecter ?')!;
      }
      try {
        if(!email) throw new Error("Impossible de récupérer l'email d'authentification");
        const response = await fbSignInWithEmailLink(email, href);
        console.debug("auth response", response); //fixme
        if(response.user) {
          this.user = response.user as fbUser;
          this.createUserProfile(response.user.uid as string, response.user.email as string);
        } else this.user = null;
      } catch (e: any) {
        this.user = null;
        this.error = e;
      } finally {
        window.localStorage.removeItem('emailForSignIn');
      }
    },
    /**
     *
     * @param data
     */
    async logoutUser() {
      try {
        await fbSignOut();
        this.user = null;
        this.error = null;
        return true;
      } catch (e: any) {
        this.error = e;
        return false;
      }
    },
    streamUserProfile(uid: string) {
      usersModule.doc(uid).stream;
    },
    async createUserProfile(uid: string, email: string) {
      await usersModule.doc(uid).fetch();
      if (!usersModule.doc(uid).data?.email) usersModule.doc(uid).insert({email: email});
    },
    

    /// Getters 
    isCurrentUserId(uid: string) {
      if (!this.isLoggedIn) return false;
      if (uid === this.uid) return true;
      return false;
    },
    async getUserProfile(uid: string){
      if (this.isCurrentUserId(uid)) return this.profile;
      const profile = await usersModule.doc(uid).fetch({ force: true })
      return profile?.data;
    },
  },
});
