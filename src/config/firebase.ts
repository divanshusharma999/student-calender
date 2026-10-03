// Firebase client configuration supporting environment variables (e.g. Vercel)
// as well as fallback credentials for standalone builds.

export interface FirebaseClientConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket?: string;
  messagingSenderId?: string;
  oAuthClientId?: string;
}

export const getFirebaseConfig = (): FirebaseClientConfig => {
  // 1. Check for Vite environment variables (configured in Vercel project settings)
  const env = typeof import.meta !== 'undefined' ? (import.meta.env as Record<string, string | undefined>) : {};

  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID || '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      oAuthClientId: env.VITE_FIREBASE_OAUTH_CLIENT_ID || '',
    };
  }

  // 2. Default client configuration
  return {
    projectId: 'gen-lang-client-0798859833',
    appId: '1:270525397285:web:1bd577d02523e39f5bc2cc',
    apiKey: 'AIzaSyAkJvEY0FwQerfj5W8c83g8UREtdQzrP04',
    authDomain: 'gen-lang-client-0798859833.firebaseapp.com',
    storageBucket: 'gen-lang-client-0798859833.firebasestorage.app',
    messagingSenderId: '270525397285',
    oAuthClientId: '270525397285-elir1nv9sl8c94gbs1029oaqarne1b29.apps.googleusercontent.com',
  };
};
