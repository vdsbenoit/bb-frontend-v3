import { firebaseConfig } from './firebaseConfig';
import { initializeApp } from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signOut,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  onAuthStateChanged,
  User,
} from "firebase/auth";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 *
 * @param email
 * @returns
 */
 export const fbSendSignInEmail = async (email: string) => {
  const actionCodeSettings = {
    // URL you want to redirect back to.
    url: `https://${location.host}/profile`,
    // This must be true.
    handleCodeInApp: true
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);

};

/**
 *
 * @param email
 * @param href
 * @returns
 */
 export const fbSignInWithEmailLink = async (email: string, href: string) => {
  if (isSignInWithEmailLink(auth, href)) {
    const response = signInWithEmailLink(auth, email, href);
    return response;
  } else {
    throw new Error("Incorrect validation url");
  }  
};

/**
 *
 * @returns
 */
export const fbSignOut = async () => {
  await signOut(auth);
  return true;
};

/**
 *
 * @param callback
 */
export const fbAuthStateListener = (callback: any) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      callback(user);
    } else {
      // User is signed out
      callback(null);
    }
  });
};

export const isNewUser = (user: User) => {
  return user.metadata.creationTime === user.metadata.lastSignInTime
}

export { db };
