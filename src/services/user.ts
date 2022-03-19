import { User as fbUser } from "firebase/auth";
import { defineStore } from "pinia";
import {
  fbAuthStateListener,
  fbResetUserProfile,
  fbSetUserProfile,
  fbGetUserProfile,
  fbCreateAccount,
  fbSendSignInEmail,
  fbSignInWithEmailLink,
  fbSignIn,
  fbSignOut,
} from "./firebase";


//fixme: no used
export interface User {
  user: any;
  profile: any;
  userError: any;
}

export interface Profile {
  email: string;
  totem: string;
  firstName: string;
  lastName: string;
  role: number;
  settings: any[];
}

export const emptyProfile = (email=""): Profile => ({
  email: email,
  totem: "",
  firstName: "",
  lastName: "",
  role: 0,
  settings: [],
})

interface State {
  user: fbUser | null;
  profile: Profile;
  error: any;
}

export const useAuthStore = defineStore("authStore", {
  state: (): State => ({
    user: null,
    profile: emptyProfile(),
    error: null,
  }),
  getters: {
    isLoggedIn: (state) => state.user !== null,
    userError: (state) => state.error,
    uid: (state): string => state.user ? state.user.uid : "",
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
            const profile = (await fbGetUserProfile(user.uid as string)) as Profile;
            this.profile = profile;
          }
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
      //fixme: replace this with an error, it should not happen
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Quel email as-tu utilisé pour te connecter ?')!;
      }
      try {
        if(!email) throw "Impossible de récupérer l'email d'authentification"
        const response = await fbSignInWithEmailLink(email, href);
        console.debug("auth response", response); //fixme
        this.user = response.user ? response.user as fbUser : null;
        if (!this.user) {
          console.error(response);
          throw "undefined user in sign in response" ;
        }
        const profile = await fbGetUserProfile(this.user.uid as string);
        if (!profile) {
          console.debug("Create a new profile for a new user");
          const profile = await fbResetUserProfile();
          this.profile = profile ? profile : this.profile;
        }
        this.error = null;
      } catch (e: any) {
        this.user = null;
        this.profile = emptyProfile();
        this.error = e;
      } finally {
        window.localStorage.removeItem('emailForSignIn');
      }
    },
    // fixme: remove unused method
    /**
     *
     * @param data
     */
    async logInUser(email: string, password: string) {
      try {
        const response = await fbSignIn(email, password);
        this.user = response.user ? response.user : null;
        this.error = null;
        return true;
      } catch (e: any) {
        this.user = null;
        this.error = e;
        return false;
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
        this.profile = emptyProfile();
        this.error = null;
        return true;
      } catch (e: any) {
        this.error = e;
        return false;
      }
    },

   // fixme: remove unused method
    /**
     *
     * @param data
     */
     async createAccount(email: string, password: string, first: string, last: string) {
        try {
          const {user, profile} = await fbCreateAccount(email, password, first,last);
          this.user = user ? user : null;
          this.profile = profile ? profile : this.profile;
          this.error = null;
          return true;
        } catch (e: any) {
          this.user = null;
          this.error = e;
          return false;
        }
      },
  },
});
