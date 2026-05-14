import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Fallback config to allow build without firebase-applet-config.json
const fallbackConfig = {
  apiKey: "mock",
  authDomain: "mock.firebaseapp.com",
  projectId: "mock",
  storageBucket: "mock.appspot.com",
  messagingSenderId: "mock",
  appId: "mock"
};

let db: any;
let auth: any;

// We'll try to use the real config if available
// In this specific agentic environment, the config is injected at runtime.
let actualConfig = fallbackConfig;

// Attempting to get the config dynamically to avoid static build errors
// In a real production build, this would be bundled or provided via env vars.

try {
  // @ts-ignore
  const configPath = './firebase-applet-config.json';
  const firebaseConfigModule = await import(/* @vite-ignore */ configPath).catch(() => ({ default: fallbackConfig }));
  actualConfig = firebaseConfigModule.default || fallbackConfig;
} catch (e) {
  // ignore
}

const app = getApps().length === 0 ? initializeApp(actualConfig) : getApps()[0];
db = getFirestore(app);
auth = getAuth(app);

export { db, auth };
