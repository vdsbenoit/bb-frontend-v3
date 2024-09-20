import { firebaseConfig } from './firebaseConfig';
import { initializeApp } from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { arrayRemove, arrayUnion, collection, doc, getDocs, getFirestore, increment, updateDoc, writeBatch } from "firebase/firestore";
import {
  getAuth,
  signOut,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);


/**
 * A helper function that generates a random Firestore ID
 * This function is used when you execute `insert` without specifying an ID
 */
export function generateRandomId() {
  return doc(collection(db, "random")).id;
}

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


export const addToDocArray = async (collection: string, docId: string, key: string, arrayValue: any) => {
  const docRef = doc(db, collection, docId);
  return updateDoc(docRef, { [key]: arrayUnion(arrayValue) });
}
export const removeFromDocArray = async (collection: string, docId: string, key: string, arrayValue: any) => {
  const docRef = doc(db, collection, docId);
  return updateDoc(docRef, { [key]: arrayRemove(arrayValue) });
}
export const incrementDocField = async (collection: string, docId: string, key: string, value: number) => {
  const docRef = doc(db, collection, docId);
  return updateDoc(docRef, { [key]: increment(value) });
}
export const updateFieldInCollection = async (collectionName: string, fieldKey: string, replacementValue: any) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  const batch = writeBatch(db);

  snapshot.forEach((document) => {
    const docRef = doc(db, collectionName, document.id);
    batch.update(docRef, { [fieldKey]: replacementValue });
  });

  return await batch.commit()
}