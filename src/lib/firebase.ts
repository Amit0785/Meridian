import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  FacebookAuthProvider,
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from "../../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export { firebaseSignOut };

export const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return provider;
};

export const createfacebookProvider = () => {
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return provider;
};

export const googleProvider = createGoogleProvider();
export const facebookProvider = createfacebookProvider();

export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export default app;
