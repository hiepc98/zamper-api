import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAQC3UKFP00qteYcpCEP2UqEN6A_KFIGmY",
  authDomain: "ramper-demo.firebaseapp.com",
  projectId: "ramper-demo",
  storageBucket: "ramper-demo.firebasestorage.app",
  messagingSenderId: "34153775357",
  appId: "1:34153775357:web:ef55825922ad4f6efe3e94",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export { firebaseApp, auth };
