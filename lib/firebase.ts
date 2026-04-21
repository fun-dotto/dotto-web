import { getApp, getApps, initializeApp } from "firebase/app";
import {
  type AppCheck,
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
const appCheckDebugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const initializeClientAppCheck = (): AppCheck | undefined => {
  if (typeof window === "undefined" || !appCheckSiteKey) {
    return undefined;
  }

  const appCheckGlobal = globalThis as typeof globalThis & {
    __FIREBASE_APP_CHECK__?: AppCheck;
    FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean;
  };

  if (appCheckGlobal.__FIREBASE_APP_CHECK__) {
    return appCheckGlobal.__FIREBASE_APP_CHECK__;
  }

  if (appCheckDebugToken) {
    appCheckGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN =
      appCheckDebugToken === "true" ? true : appCheckDebugToken;
  }

  try {
    const instance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckGlobal.__FIREBASE_APP_CHECK__ = instance;
    return instance;
  } catch {
    return undefined;
  }
};

export const appCheck = initializeClientAppCheck();

export const auth = getAuth(app);
