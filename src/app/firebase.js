import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsQI8t_hqlfPVaJjLqul9gTHiF7KwUrss",
  authDomain: "study-shuttle.firebaseapp.com",
  projectId: "study-shuttle",
  storageBucket: "study-shuttle.appspot.com",
  messagingSenderId: "527519082041",
  appId: "1:527519082041:web:87d6e8039a0b76582b4fe8",
  measurementId: "G-V0FZQ175LD",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db };
